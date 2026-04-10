import { describe, expect, it, vi } from 'vitest'

import RegisteredRoom from '../../../Domains/rooms/entities/RegisteredRoom.js'
import RoomRepository from '../../../Domains/rooms/RoomRepository.js'
import AddRoomUseCase from '../AddRoomUseCase.js'
import RegisterRoom from '../../../Domains/rooms/entities/RegisterRoom.js'
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js'

describe('AddRoomUseCase', () => {
  it('should throw AuthorizationError when role is not owner', async () => {
    // Arrange
    const useCasePayload = {
      role: 'tenant',
      owner_id: 'user-123',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
    }

    const mockRoomRepository = new RoomRepository()
    const addRoomUseCase = new AddRoomUseCase({ roomRepository: mockRoomRepository })

    // Action & Assert
    await expect(addRoomUseCase.execute(useCasePayload))
      .rejects.toThrow(AuthorizationError)
  })

  it('should throw error when addRoom repository throws', async () => {
    // Arrange
    const useCasePayload = {
      role: 'owner',
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
    }

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.addRoom = vi.fn().mockRejectedValue(new Error('DB_ERROR'))

    const addRoomUseCase = new AddRoomUseCase({ roomRepository: mockRoomRepository })

    // Action & Assert
    await expect(addRoomUseCase.execute(useCasePayload))
      .rejects.toThrowError('DB_ERROR')
  })

  it('should orchestrating the add room correctly without facilities', async () => {
    // Arrange
    const useCasePayload = {
      role: 'owner',
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
    }

    const mockRegisteredRoom = new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01',
    })

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.addRoom = vi.fn().mockResolvedValue(mockRegisteredRoom)

    const addRoomUseCase = new AddRoomUseCase({ roomRepository: mockRoomRepository })

    // Action
    const registeredRoom = await addRoomUseCase.execute(useCasePayload)

    // Assert
    expect(registeredRoom).toStrictEqual(new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01',
    }))
    expect(mockRoomRepository.addRoom).toBeCalledWith(new RegisterRoom({
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
    }))
  })

  it('should orchestrating the add room correctly with facilities', async () => {
    // Arrange
    const useCasePayload = {
      role: 'owner',
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
      facilities: ['sleeping equipment', 'bathroom'],
    }

    const mockRegisteredRoom = new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01',
    })

    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.addRoom = vi.fn().mockResolvedValue(mockRegisteredRoom)

    const addRoomUseCase = new AddRoomUseCase({ roomRepository: mockRoomRepository })

    // Action
    const registeredRoom = await addRoomUseCase.execute(useCasePayload)

    // Assert
    expect(registeredRoom).toStrictEqual(new RegisteredRoom({
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01',
    }))
    expect(mockRoomRepository.addRoom).toBeCalledWith(new RegisterRoom({
      owner_id: 'owner-345',
      room_number: '01',
      type: '4 x 6 meter',
      price: 600000,
      facilities: ['sleeping equipment', 'bathroom'],
    }))
  })
})