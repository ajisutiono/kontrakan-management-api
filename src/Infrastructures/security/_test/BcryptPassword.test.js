import bcrypt from 'bcrypt'
import { describe, expect, it, vi } from 'vitest'

import AuthenticationError from '../../../Commons/exceptions/AuthenticationError'
import BcryptPasswordHash from '../BcryptPasswordHash'

describe('BcryptPasswordHash', () => {
  describe('hash function', () => {
    it('should hash password correctly', async() => {
      const spyHash = vi.spyOn(bcrypt, 'hash')

      const bcryptPasswordHash = new BcryptPasswordHash({bcrypt})

      const hashedPassword = await bcryptPasswordHash.hash('plain_password')

      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword).not.toBe('plain_password')
      expect(spyHash).toBeCalledWith('plain_password', 10)
    })

    it('should use custom saltRound when provided', async() => {
      const spyHash = vi.spyOn(bcrypt, 'hash')

      const bcryptPasswordHash = new BcryptPasswordHash({ bcrypt, saltRound: 12 })

      await bcryptPasswordHash.hash('plain_password')

      expect(spyHash).toBeCalledWith('plain_password', 12)
    })
  })

  describe('comparePassword function', () => {
    it('should not throw when password matches', async() => {
      const bcryptPasswordHash = new BcryptPasswordHash({bcrypt})

      const hashedPassword = await bcrypt.hash('plain_password', 10)

      await expect(bcryptPasswordHash.comparePassword('plain_password', hashedPassword))
        .resolves.not.toThrow()
    })

    it('should throw AuthenticationError when passowrd does not match', async() => {
      const bcryptPasswordHash = new BcryptPasswordHash({bcrypt})

      const hashedPassword = await bcrypt.hash('plain_password', 10)

      await expect(bcryptPasswordHash.comparePassword('wrong_password', hashedPassword))
        .rejects.toThrowError('BCRYPT_PASSWORD_HASH.PASSWORD_NOT_MATCH')
      await expect(bcryptPasswordHash.comparePassword('wrong_password', hashedPassword))
        .rejects.toBeInstanceOf(AuthenticationError)
    })
  })
})