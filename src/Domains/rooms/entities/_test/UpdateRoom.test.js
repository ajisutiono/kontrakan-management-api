import { describe, expect, it } from 'vitest'

import UpdateRoom from '../UpdateRoom.js'

describe('UpdateRoom Entity', () => {

  it('should throw error when none of the needed property', () => {
    expect(() => new UpdateRoom({}))
      .toThrowError('UPDATE_ROOM.NEED_AT_LEAST_ONE_PROPERTY')
  })

  it('should throw error when room_number is not a string', () => {
    expect(() => new UpdateRoom({ room_number: 123 }))
      .toThrowError('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when type is not a string', () => {
    expect(() => new UpdateRoom({ type: true }))
      .toThrowError('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when price is not a number', () => {
    expect(() => new UpdateRoom({ price: '500000' }))
      .toThrowError('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when facilities is not an array', () => {
    expect(() => new UpdateRoom({ facilities: { 1: 'AC' } }))
      .toThrowError('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when status is not available or booked', () => {
    expect(() => new UpdateRoom({ status: 'ready' }))
      .toThrowError('UPDATE_ROOM.INVALID_STATUS')
  })

  it('should throw error when room_number more than 10 characters', () => {
    expect(() => new UpdateRoom({ room_number: '1'.repeat(11) }))
      .toThrowError('UPDATE_ROOM.ROOM_NUMBER_TOO_LONG')
  })

  it('should throw error when type more than 50 characters', () => {
    expect(() => new UpdateRoom({ type: '4'.repeat(51) }))
      .toThrowError('UPDATE_ROOM.TYPE_TOO_LONG')
  })

  it('should create UpdateRoom entity correctly when payload is valid', () => {
    const payload = {
      room_number: '01',
      type: '4 x 5 meter',
      price: 500000,
      status: 'available',
    }

    const updateRoom = new UpdateRoom(payload)

    expect(updateRoom.room_number).toBe('01')
    expect(updateRoom.type).toBe('4 x 5 meter')
    expect(updateRoom.price).toBe(500000)
    expect(updateRoom.status).toBe('available')
    expect(updateRoom.facilities).toBeUndefined()
  })

})