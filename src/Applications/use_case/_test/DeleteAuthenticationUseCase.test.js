import { describe, expect, it, vi } from 'vitest'
import DeleteAuthenticationUseCase from '../DeleteAuthenticationUseCase.js'

describe('DeleteAuthenticationUseCase', () => {
  it('should throw error when payload not contain needed property', async() => {
    // missing useCasePayload

    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({})

    await expect(deleteAuthenticationUseCase.execute({}))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', async() => {
    const useCasePayload = {
      refreshToken: true
    }

    const mockAuthenticationRepository = {
      checkAvailabilityToken: vi.fn().mockResolvedValue(),
      deleteToken: vi.fn().mockResolvedValue()
    }


    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
    })

    await expect(deleteAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrate delete authentication correctly', async() => {
    const useCasePayload = {
      refreshToken: 'refresh_token',
    }

    const mockAuthenticationRepository = {
      checkAvailabilityToken: vi.fn().mockResolvedValue(useCasePayload),
      deleteToken: vi.fn().mockResolvedValue(useCasePayload)
    }

    const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository
    })

    await deleteAuthenticationUseCase.execute(useCasePayload)

    expect(mockAuthenticationRepository.checkAvailabilityToken).toHaveBeenCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationRepository.deleteToken).toHaveBeenCalledWith(useCasePayload.refreshToken)
  })
})