import { describe, expect, it, vi } from 'vitest'

import BookingRepository from '../../../Domains/bookings/BookingRepository.js'
import GetMyBookingsUseCase from '../GetMyBookingsUseCase.js'

describe('GetMyBookingsUseCase', () => {

  it('should filter by tenantId when role is tenant', async () => {
    const mockBookingRepository = new BookingRepository()
    mockBookingRepository.getBookings = vi.fn().mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    })

    const getMyBookingsUseCase = new GetMyBookingsUseCase({
      bookingRepository: mockBookingRepository,
    })

    await getMyBookingsUseCase.execute({
      userId: 'tenant-123',
      userRole: 'tenant',
    })

    expect(mockBookingRepository.getBookings).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ tenantId: 'tenant-123' }),
      })
    )
  })

  it('should filter by ownerId when role is owner', async () => {
    const mockBookingRepository = new BookingRepository()
    mockBookingRepository.getBookings = vi.fn().mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    })

    const getMyBookingsUseCase = new GetMyBookingsUseCase({
      bookingRepository: mockBookingRepository,
    })

    await getMyBookingsUseCase.execute({
      userId: 'owner-123',
      userRole: 'owner',
    })

    expect(mockBookingRepository.getBookings).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ ownerId: 'owner-123' }),
      })
    )
  })

  it('should pass pagination params correctly', async () => {
    const mockBookingRepository = new BookingRepository()
    mockBookingRepository.getBookings = vi.fn().mockResolvedValue({
      data: [],
      page: 2,
      limit: 5,
      total: 10,
      totalPages: 2,
    })

    const getMyBookingsUseCase = new GetMyBookingsUseCase({
      bookingRepository: mockBookingRepository,
    })

    await getMyBookingsUseCase.execute({
      userId: 'tenant-123',
      userRole: 'tenant',
      page: 2,
      limit: 5,
    })

    expect(mockBookingRepository.getBookings).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 5,
      })
    )
  })

  it('should orchestrate get bookings action correctly and return result', async () => {
    const mockResult = {
      data: [
        {
          id: 'booking-123',
          room_id: 'room-123',
          tenant_id: 'tenant-123',
          start_date: '2026-10-01',
          status: 'active',
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }

    const mockBookingRepository = new BookingRepository()
    mockBookingRepository.getBookings = vi.fn().mockResolvedValue(mockResult)

    const getMyBookingsUseCase = new GetMyBookingsUseCase({
      bookingRepository: mockBookingRepository,
    })

    const result = await getMyBookingsUseCase.execute({
      userId: 'tenant-123',
      userRole: 'tenant',
    })

    expect(result).toEqual(mockResult)
  })

})