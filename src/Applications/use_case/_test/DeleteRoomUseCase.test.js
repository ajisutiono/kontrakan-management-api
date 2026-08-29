import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository'
import DeleteRoomUseCase from '../DeleteRoomUseCase'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'

describe('DeleteRoomById use case', () => {
  /* skenario test
      1. hanya role owner yang bisa menghapus, jika bukan maka throw error 403
      2. 404 jika room tidak ditemukan
      3. hanya pemilik room yang bisa menghapus ruangan, jika bukan owner pemilik ruangan maka throw error 403
      4. success
    */

  it('should throw error 403 when role is not owner', async () => {
    const mockRoomRepository = new RoomRepository()

    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ owner_id: 'user-123' })

    const deleteRoomUseCase = new DeleteRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(deleteRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-123',
      role: 'tenant',
      payload: { room_number: '01' },
    })).rejects.toThrow('hanya owner yang dapat menghapus kamar')
  })

  it('should throw 404 NotFoundError when room not found', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockRejectedValue(new NotFoundError('Room tidak ditemukan'))

    const deleteRoomUseCase = new DeleteRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(deleteRoomUseCase.execute({
      roomId: 'room-tidak-ada',
      ownerId: 'user-123',
      role: 'owner',
    })).rejects.toThrow(NotFoundError)
  })

  it('should throw 403 authorizationError when ownerId not room owner', async () => {
    const mockRoomRepository = new RoomRepository()

    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ owner_id: 'user-123' })

    const deleteRoomUseCase = new DeleteRoomUseCase({ roomRepository: mockRoomRepository })

    await expect(deleteRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-456',
      role: 'owner',
      payload: { room_number: '01' },
    })).rejects.toThrow('Anda tidak memiliki akses untuk menghapus kamar ini')
  })

  it('should orchestrate delete room action correctly', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ owner_id: 'user-123' })
    mockRoomRepository.deleteRoomById = vi.fn().mockResolvedValue()

    const deleteRoomUseCase = new DeleteRoomUseCase({ roomRepository: mockRoomRepository })

    await deleteRoomUseCase.execute({
      roomId: 'room-123',
      ownerId: 'user-123',
      role: 'owner',
    })

    expect(mockRoomRepository.deleteRoomById).toHaveBeenCalledWith('room-123')
  })
})