import { describe, expect, it } from 'vitest'
import AuthenticationRepository from '../AuthenticationRepository'

describe('AuthenticationRepository interface', () => {
  it('should throw error when invoke unimplemented method', async() => {
    const authenticationRepository = new AuthenticationRepository()

    await expect(authenticationRepository.addToken(''))
      .rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(authenticationRepository.checkAvailableToken(''))
      .rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(authenticationRepository.deleteToken(''))
      .rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})