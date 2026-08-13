import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository'
import UpdateRoomUseCase from '../UpdateRoomUseCase'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'

describe('UpdateRoom use case', () => {
  /*
  urutan test
  403 jika role bukan owner
  400 jika payload tidak valid (entity validation)
  404 jika room tidak ditemukan
  403 jika bukan pemilik room
  success jika semua valid
  */
  it('should throw authorizationError when role is not owner', async () => {
    const mockRoomRepository = new RoomRepository()
    const updateRoomUseCase = new UpdateRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(updateRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-123',
      role: 'tenant',
      payload: { room_number: '02' },
    })).rejects.toThrow('hanya owner yang dapat mengedit ruangan')
  })

  it('should throw error when payload not meet data type specification', async () => {
    const mockRoomRepository = new RoomRepository()
    const updateRoomUseCase = new UpdateRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(updateRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-123',
      role: 'owner',
      payload: { room_number: 123 },  // number, harusnya string
    })).rejects.toThrow('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should error when room not found', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockRejectedValue(new NotFoundError('Room tidak ditemukan'))

    const updateRoomUseCase = new UpdateRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(updateRoomUseCase.execute({
      roomId: 'room-tidak-ada',
      ownerId: 'user-123',
      role: 'owner',
      payload: { room_number: '01' },
    })).rejects.toThrow(NotFoundError)
  })

  it('should authorizationError when ownerId not room owner', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ owner_id: 'user-123' })

    const updateRoomUseCase = new UpdateRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(updateRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-234',
      role: 'owner',
      payload: { room_number: '01' },
    })).rejects.toThrow('Anda tidak memiliki akses untuk mengedit kamar ini')
  })

  it('should orchestrate update room action correctly', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ owner_id: 'user-123' })
    mockRoomRepository.updateRoomById = vi.fn().mockResolvedValue({ room_number: '01' })

    const updateRoomUseCase = new UpdateRoomUseCase({ roomRepository: mockRoomRepository })

    await updateRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-123',
      role: 'owner',
      payload: { room_number: '01' },
    })

    expect(mockRoomRepository.updateRoomById).toHaveBeenCalledWith(
      'room-123',
      expect.objectContaining({ room_number: '01' })
    )
  })
})