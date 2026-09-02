import { beforeEach, describe, expect, it } from 'vitest'
import BookingRepository from '../BookingRepository'

describe('BookingRepository abstract methods', () => {
  let repository

  beforeEach(() => {
    repository = new BookingRepository()
  })

  it('addBooking should throw METHOD_NOT_IMPLEMENTED', async() => {
    await expect(repository.addBooking())
      .rejects.toThrowError('BOOKING_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})