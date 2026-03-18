import { describe, expect, it, vi } from 'vitest'
import LoginUserUseCase from '../LoginUserUseCase.js'

describe('LoginUserUseCase', () => {
  it('should throw error when payload not contain needed property', async() => {
    const useCasePayload = {
      email: 'testing@mail.com',
      // missing password
    }

    const loginUserUseCase = new LoginUserUseCase({})

    await expect(loginUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', async() => {
    const useCasePayload = {
      email: true,
      password: 'Password1!'
    }

    const loginUserUseCase = new LoginUserUseCase({})

    await expect(loginUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrate login user correctly', async() => {
    const useCasePayload = {
      email: 'testing@mail.com',
      password: 'Password1!'
    }

    const mockUserRepository = {
      getPasswordByEmail: vi.fn().mockResolvedValue('encrypted_password'),
      getIdByEmail: vi.fn().mockResolvedValue('user-123')
    }

    const mockPasswordHash = {
      comparePassword: vi.fn().mockResolvedValue()
    }

    const mockTokenManager = {
      createAccessToken: vi.fn().mockResolvedValue('access_token'),
      createRefreshToken: vi.fn().mockResolvedValue('refresh_token')
    }

    const mockAuthenticationRepository = {
      addToken: vi.fn().mockResolvedValue('refresh_token')
    }

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager,
      passwordHash: mockPasswordHash,
    })

    const result = await loginUserUseCase.execute(useCasePayload)

    expect(mockUserRepository.getPasswordByEmail).toBeCalledWith('testing@mail.com')
    expect(mockPasswordHash.comparePassword).toBeCalledWith('Password1!', 'encrypted_password')
    expect(mockUserRepository.getIdByEmail).toBeCalledWith('testing@mail.com')
    expect(mockTokenManager.createAccessToken).toBeCalledWith({ email: 'testing@mail.com', id: 'user-123' })
    expect(mockTokenManager.createRefreshToken).toBeCalledWith({ email: 'testing@mail.com', id: 'user-123' })
    expect(mockAuthenticationRepository.addToken).toBeCalledWith('refresh_token')

    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    })

  })
})