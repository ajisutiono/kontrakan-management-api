import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository.js'
import GetMyRoomUseCase from '../GetMyRoomUseCase.js'
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js'

describe('GetMyRoomUseCase', () => {
  it('should orchestrate correctly and inject ownerId into filters', async() => {
    // Arrange
    const useCasePayload = {
      ownerId: 'user-123',
      userRole: 'owner',
      filters: {
        minPrice: 100000,
        maxPrice: 500000,
      },
      page: 1,
      limit: 10,
    }

    const mockResult = { data: [] }

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRooms = vi.fn().mockResolvedValue(mockResult)


    const getMyRoomsUseCase = new GetMyRoomUseCase({
      roomRepository: mockRoomRepository,
    })

    // Action
    const result = await getMyRoomsUseCase.execute(useCasePayload)

    // Assert
    expect(result).toStrictEqual(mockResult)

    expect(mockRoomRepository.getRooms).toBeCalledWith({
      filters: {
        ownerId: 'user-123',
        minPrice: 100000,
        maxPrice: 500000,
      },
      page: 1,
      limit: 10,
    })
  })

  it('should throw AuthorizationError when role is not owner', async () => {
    const useCasePayload = {
      ownerId: 'user-123',
      userRole: 'tenant',
    }

    const useCase = new GetMyRoomUseCase({
      roomRepository: {},
    })

    await expect(useCase.execute(useCasePayload))
      .rejects
      .toThrow(AuthorizationError)
  })

  it('should override ownerId from filters with auth ownerId', async () => {
    const useCasePayload = {
      ownerId: 'owner-real',
      userRole: 'owner',
      filters: {
        ownerId: 'fake-owner', // input yang tidak diketahui/jahat
      },
    }

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRooms = vi.fn().mockResolvedValue({})

    const useCase = new GetMyRoomUseCase({
      roomRepository: mockRoomRepository,
    })

    await useCase.execute(useCasePayload)

    expect(mockRoomRepository.getRooms).toBeCalledWith({
      filters: {
        ownerId: 'owner-real', // harus override owner asli
      },
      page: 1,
      limit: 10,
    })
  })
})