import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository.js'
import GetRoomsUseCase from '../GetRoomsUseCase.js'
describe('GetRoomsUseCase', () => {
  it('should orchestrate the get rooms action correctly', async() => {
    const useCasePayload = {
      filters: {
        ownerId: 'user-123',
        minPrice: 100000,
        maxPrice: 500000,
      },
      page: 1,
      limit: 10,
      userRole: 'owner',
    }

    const expectedResult = {
      data: [
        {
          id: 'room-1',
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available',
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }

    const mockRoomRepository = new RoomRepository()

    mockRoomRepository.getRooms = vi.fn().mockResolvedValue(expectedResult)

    const getRoomsUseCase = new GetRoomsUseCase({
      roomRepository: mockRoomRepository
    })

    const result = await getRoomsUseCase.execute(useCasePayload)

    expect(result).toStrictEqual(expectedResult)
    expect(mockRoomRepository.getRooms).toHaveBeenCalledWith({
      filters: useCasePayload.filters,
      page: useCasePayload.page,
      limit: useCasePayload.limit,
      userRole: useCasePayload.userRole
    })
  })

  it('should use default parameters when payload is empty', async () => {
    // Arrange
    const expectedResult = {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    }

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRooms = vi.fn()
      .mockImplementation(() => Promise.resolve(expectedResult))

    const getRoomsUseCase = new GetRoomsUseCase({
      roomRepository: mockRoomRepository,
    })

    // Action
    const result = await getRoomsUseCase.execute({ userRole: 'tenant' })

    // Assert
    expect(result).toStrictEqual(expectedResult)
    expect(mockRoomRepository.getRooms).toHaveBeenCalledWith({
      filters: {}, // default
      page: 1,     // default
      limit: 10,    // default
      userRole: 'tenant',
    })
  })
})
