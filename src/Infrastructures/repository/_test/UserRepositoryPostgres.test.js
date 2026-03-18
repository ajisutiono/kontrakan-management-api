import { randomUUID } from 'crypto'

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import pool from '../../database/postgres/pool.js'
import UserRepositoryPostgres from '../UserRepositoryPostgres.js'
import InvariantError from '../../../Commons/exceptions/InvariantError.js'
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js'

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('verifyAvailableEmail function', () => {
    it('should not throw when email available', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      await expect(userRepositoryPostgres.verifyAvailableEmail('test2@example.com'))
        .resolves.not.toThrow()
    })

    it('should throw InvariantError when email already exists', async () => {
      await UsersTableTestHelper.addUser({ email: 'test@example.com' })
      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      await expect(
        userRepositoryPostgres.verifyAvailableEmail('test@example.com')
      ).rejects.toThrowError('tidak dapat membuat user baru karena email sudah ada')

      await expect(
        userRepositoryPostgres.verifyAvailableEmail('test@example.com')
      ).rejects.toBeInstanceOf(InvariantError)
    })
  })

  describe('addUser function', () => {
    it('should persist user and return registered user correctly', async () => {
      const registerUser = {
        name: 'Example User',
        email: 'example@mail.com',
        password: 'H4shed_password',
        role: 'owner',
      }

      const fakeId = randomUUID()

      const mockIdGenerator = vi.fn().mockReturnValue(fakeId)

      const userRepositoryPostgres = new UserRepositoryPostgres({pool, idGenerator: mockIdGenerator})

      const registeredUser = await userRepositoryPostgres.addUser(registerUser)

      expect(registeredUser).toEqual({
        id: fakeId,
        name: 'Example User',
        role: 'owner',
      })

      const user = await UsersTableTestHelper.findUserById(fakeId)
      expect(user).toBeDefined()
      expect(user.email).toBe('example@mail.com')
      expect(user.password).toBe('H4shed_password')
    })
  })

  describe('findUserById function', () => {
    it('should return user when id exists', async() => {
      const fakeId = randomUUID()

      await UsersTableTestHelper.addUser({ id: fakeId })

      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      const user = await userRepositoryPostgres.findUserById(fakeId)

      expect(user.id).toBe(fakeId)
    })

    it('should throw NotFoundError when id not found', async() => {
      const fakeId = randomUUID()
      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      const user = userRepositoryPostgres.findUserById(fakeId)

      await expect(user).rejects.toThrowError('user tidak ditemukan')
      await expect(user).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe('findUserByEmail', () => {
    it('should return user when email exists', async() => {
      await UsersTableTestHelper.addUser({ email: 'testing@mail.com' })

      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      const user = await userRepositoryPostgres.findUserByEmail('testing@mail.com')

      expect(user.email).toBe('testing@mail.com')
    })

    it('should throw NotFoundError when email not found', async() => {
      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      const user = userRepositoryPostgres.findUserByEmail('notfound@mail.com')

      await expect(user).rejects.toThrowError('email user tidak ditemukan')
      await expect(user).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when email found', async() => {
      const fakeId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: fakeId,
        email: 'testing@mail.com',
        password: 'Password1!',
      })

      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      const user = await userRepositoryPostgres.getUserByEmail('testing@mail.com')

      expect(user.id).toBe(fakeId)
      expect(user.password).toBe('Password1!')
    })
  
    it('should throw NotFoundError when email not found', async() => {
      const userRepositoryPostgres = new UserRepositoryPostgres({pool})

      await expect(userRepositoryPostgres.getUserByEmail('notfoundemail@mail.com'))
        .rejects.toThrowError('user tidak ditemukan')
      await expect(userRepositoryPostgres.getUserByEmail('notfoundemail@mail.com'))
        .rejects.toBeInstanceOf(NotFoundError)
    })
  })
})