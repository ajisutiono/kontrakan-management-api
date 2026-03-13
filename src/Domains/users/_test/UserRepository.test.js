import { beforeEach, describe, expect, it } from 'vitest'

import UserRepository from '../UserRepository.js'

describe('UserRepository abstract methods', () => {
  let repository

  beforeEach(() => {
    repository = new UserRepository()
  })

  it('addUser should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.addUser({})).rejects.toThrowError(
      'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    )
  })

  it('verifyAvailableEmail should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(
      repository.verifyAvailableEmail('test@example.com'),
    ).rejects.toThrowError('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })

  it('findUserById should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(
      repository.findUserById('user-123'),
    ).rejects.toThrowError('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })

  it('findUserByEmail should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(
      repository.findUserByEmail('test@example.com'),
    ).rejects.toThrowError('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})