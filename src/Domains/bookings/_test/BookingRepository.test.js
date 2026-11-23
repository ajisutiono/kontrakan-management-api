import { beforeEach, describe, expect, it } from 'vitest'
import BookingRepository from '../BookingRepository'

describe('BookingRepository abstract methods', () => {
  let repository

  beforeEach(() => {
    repository = new BookingRepository()
  })

  it('addBooking should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.addBooking())
      .rejects.toThrowError('BOOKING_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })

  it('getBookings should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.getBookings({}))
      .rejects.toThrowError('BOOKING_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })

  it('getBookingById should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.getBookingById())
      .rejects.toThrowError('BOOKING_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })

  it('cancelBookingById should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.cancelBookingById({}))
      .rejects.toThrowError('BOOKING_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})