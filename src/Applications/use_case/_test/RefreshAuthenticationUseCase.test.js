import { describe, expect, it, vi } from 'vitest'
import RefreshAuthenticationUseCase from '../RefreshAuthenticationUseCase.js'

describe('RefreshAuthentication use case', () => {
  it('should throw error when payload not contain needed property', async() => {
    // missing useCasePayload

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({})

    await expect(refreshAuthenticationUseCase.execute({}))
      .rejects
      .toThrowError('REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', async() => {
    const useCasePayload = {
      refreshToken: 123
    }

    const mockAuthenticationRepository = {
      checkAvailabilityToken: vi.fn().mockResolvedValue()
    }

    const mockTokenManager = {
      verifyRefreshToken: vi.fn().mockResolvedValue(),
    }

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager
    })

    await expect(refreshAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrate refresh authentication correctly', async() => {
    const useCasePayload = {
      refreshToken: 'refresh_token',
    }

    const mockAuthenticationRepository = {
      checkAvailabilityToken: vi.fn().mockResolvedValue(useCasePayload)
    }

    const mockTokenManager = {
      verifyRefreshToken: vi.fn().mockResolvedValue(useCasePayload),
      decodePayload: vi.fn().mockResolvedValue({email: 'testing@mail.com', id: 'user-123'}),
      createAccessToken: vi.fn().mockResolvedValue('newAccess_token'),
    }

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager
    })

    const result = await refreshAuthenticationUseCase.execute(useCasePayload)

    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith('refresh_token')
    expect(mockTokenManager.verifyRefreshToken).toBeCalledWith('refresh_token')
    expect(mockTokenManager.decodePayload).toBeCalledWith('refresh_token')
    expect(mockTokenManager.createAccessToken).toBeCalledWith({email: 'testing@mail.com', id: 'user-123'})
    expect(result).toEqual('newAccess_token')
  })
})