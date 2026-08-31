import { describe, it, expect } from 'vitest'

import RegisterBooking from '../RegisterBooking'

describe('RegisterBooking entity', () => {
  it('should throw error when room_id is missing', () => {
    const payload = {
      // missing room_id
      tenant_id: 'tenant-123',
      start_date: '2026-10-01'
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when tenant_id is missing', () => {
    const payload = {
      room_id: 'room-123',
      // missing tenant_id
      start_date: '2026-10-01'
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when start_date is missing', () => {
    const payload = {
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      // missing start_date
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when room_id is not a string', () => {
    const payload = {
      room_id: 123,
      tenant_id: 'tenant-123',
      start_date: '2026-10-01'
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when tenant_id is not a string', () => {
    const payload = {
      room_id: 'room-123',
      tenant_id: true,
      start_date: '2026-10-01'
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when start_date is not a valid date format', () => {
    const payload = {
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: 'not-a-date'
    }

    expect(() => new RegisterBooking(payload)).toThrowError('REGISTER_BOOKING.INVALID_START_DATE')
  })

  it('should create RegisterBooking entity correctly when payload is valid', () => {
    const payload = {
      room_id: 'room-123',
      tenant_id: 'tenant-123',
      start_date: '2026-10-01'
    }

    const registerBooking = new RegisterBooking(payload)

    expect(registerBooking.room_id).toBe(payload.room_id)
    expect(registerBooking.tenant_id).toBe(payload.tenant_id)
    expect(registerBooking.start_date).toBe(payload.start_date)
  })
})