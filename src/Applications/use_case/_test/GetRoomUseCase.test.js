import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository.js'
import GetRoomUseCase from '../GetRoomUseCase.js'

describe('GetRoomUseCase', () => {
  it('should orchestrate get room by id action correctly', async() => {
    // arrange
    const roomId = 'room-123'

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ id: roomId})

    const getRoomUseCase = new GetRoomUseCase({
      roomRepository: mockRoomRepository
    })

    // action
    const result = await getRoomUseCase.execute(roomId)

    expect(result).toStrictEqual({ id: roomId })

    expect(mockRoomRepository.getRoomById).toHaveBeenCalledWith(roomId)

  })
})