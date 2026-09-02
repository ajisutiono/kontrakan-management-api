import { describe, expect, it, vi } from 'vitest'

import RoomRepository from '../../../Domains/rooms/RoomRepository'
import BookingRepository from '../../../Domains/bookings/BookingRepository'
import AddBookingUseCase from '../AddBookingUseCase'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'

describe('AddBookingUseCase', () => {
// 1. should throw AuthorizationError when role is not tenant
// 2. should throw error when payload is invalid (entity validation)
// 3. should throw NotFoundError when room not found
// 4. should throw InvariantError when room is not available
// 5. should orchestrate add booking action correctly
  it('should throw AuthorizationError when role is not tenant', async() => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ room_id: 'room-123' })

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository, 
      roomRepository: mockRoomRepository
    })

    await expect(addBookingUseCase.execute({
      role: 'owner',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
      status: 'available'
    })).rejects.toThrow('hanya tenant yang dapat booking ruangan')
  })

  it('should throw Error when payload not contain needed property', async() => {
    const mockRoomRepository = new RoomRepository()
    // mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ room_id: 'room-123' })

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository, 
      roomRepository: mockRoomRepository
    })

    await expect(addBookingUseCase.execute({
      role: 'tenant',
    // missing room_id, tenant_id, start_date
    })).rejects.toThrow('REGISTER_BOOKING.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw Error when payload not meet data type specification', async() => {
    const mockRoomRepository = new RoomRepository()
    // mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ room_id: 'room-123' })

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository, 
      roomRepository: mockRoomRepository
    })

    await expect(addBookingUseCase.execute({
      role: 'tenant',
      room_id: 123,          // should be string
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
    })).rejects.toThrow('REGISTER_BOOKING.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw Error when start_date invalid format', async() => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ room_id: 'room-123' })

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository, 
      roomRepository: mockRoomRepository
    })

    await expect(addBookingUseCase.execute({
      role: 'tenant',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: 'not-a-date',
    })).rejects.toThrow('REGISTER_BOOKING.INVALID_START_DATE')
  })

  it('should throw NotFoundError when room not found', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockRejectedValue(new NotFoundError('Room not found'))

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository,
      roomRepository: mockRoomRepository,
    })

    await expect(addBookingUseCase.execute({
      role: 'tenant',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
    })).rejects.toThrow(NotFoundError)
  })

  it('should throw InvariantError when room is not available', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ room_id: 'room-123', status: 'booked' })

    const mockBookingRepository = new BookingRepository()
    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository,
      roomRepository: mockRoomRepository,
    })

    await expect(addBookingUseCase.execute({
      role: 'tenant',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
    })).rejects.toThrow('Ruangan ini tidak tersedia')
  })

  it('should orchestrate add booking action correctly', async () => {
    const mockRoomRepository = new RoomRepository()
    mockRoomRepository.getRoomById = vi.fn().mockResolvedValue({ status: 'available' })

    const mockBookingRepository = new BookingRepository()
    mockBookingRepository.addBooking = vi.fn().mockResolvedValue({
      id: 'booking-123',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
    })

    const addBookingUseCase = new AddBookingUseCase({
      bookingRepository: mockBookingRepository,
      roomRepository: mockRoomRepository,
    })

    await addBookingUseCase.execute({
      role: 'tenant',
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01',
    })

    expect(mockBookingRepository.addBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'room-123',
        tenant_id: 'tenant-123',
        start_date: '2026-10-01',
      })
    )
  })

})