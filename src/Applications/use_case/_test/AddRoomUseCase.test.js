import { describe, expect, it, vi } from 'vitest'

import RegisteredRoom from '../../../Domains/rooms/entities/RegisteredRoom.js'
import RoomRepository from '../../../Domains/rooms/RoomRepository.js'
import AddRoomUseCase from '../AddRoomUseCase.js'
import RegisterRoom from '../../../Domains/rooms/entities/RegisterRoom'

describe('AddRoomUseCase', () => {
  it('should orchestrating the add user correctly', async() => {
    const useCasePayload = {
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
      facilities: {
        1: 'sleeping equipment',
        2: 'batthroom'
      }
    }

    const mockRegisteredRoom = new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01',
    })

    // dependecy
    const mockRoomRepository = new RoomRepository()

    mockRoomRepository.addRoom = vi.fn()
      .mockResolvedValue(mockRegisteredRoom)

    const addRoomUseCase = new AddRoomUseCase({
      roomRepository: mockRoomRepository
    })

    const registeredRoom =  await addRoomUseCase.execute(useCasePayload)

    expect(registeredRoom).toStrictEqual(new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01'
    }))
    expect(mockRoomRepository.addRoom).toBeCalledWith(new RegisterRoom(useCasePayload))
  })
})