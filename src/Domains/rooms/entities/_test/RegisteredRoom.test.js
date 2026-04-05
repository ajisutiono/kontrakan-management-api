import { describe, expect, it } from 'vitest'

import RegisteredRoom from '../RegisteredRoom.js'

describe('RegisteredRoom entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'room-123',
      owner_id: 'owner-345',
      // missing room_number
    }

    expect(() => new RegisteredRoom(payload)).toThrowError('REGISTERED_ROOM.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: 1 // data type of room_number should string, not integer
    }

    expect(() => new RegisteredRoom(payload)).toThrowError('REGISTERED_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create RegisteredRoom correctly', () => {
    const payload = {
      id: 'room-123',
      owner_id: 'owner-345',
      room_number: '01'
    }

    const registeredRoom = new RegisteredRoom(payload)

    expect(registeredRoom.id).toBe(payload.id)
    expect(registeredRoom.owner_id).toBe(payload.owner_id)
    expect(registeredRoom.room_number).toBe(payload.room_number)
  })
})