import { describe, expect, it } from 'vitest'

import RegisterRoom from '../RegisterRoom.js'

describe('RegisterRoom entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      room_number: '01',
      type: '4 x 5 meter',
      // missing price
    }

    expect(() => new RegisterRoom(payload)).toThrowError('REGISTER_ROOM.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      owner_id: '100',  
      room_number: '01',
      type: '4 x 5 meter',
      price: '500000', // should integer
      facilities: {
        1: 'sleeping equipment',
        2: 'batthroom'
      }
    }

    expect(() => new RegisterRoom(payload)).toThrowError('REGISTER_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when payload room_number more than 10 characters', () => {
    const payload = {
      owner_id: '100', 
      room_number: '1'.repeat(11),
      type: '4 x 5 meter',
      price: 500000,
      facilities: {
        1: 'sleeping equipment',
        2: 'batthroom'
      }
    }

    expect(() => new RegisterRoom(payload)).toThrowError('REGISTER_ROOM.ROOM_NUMBER_TOO_LONG')
  })

  it('should throw error when payload type more than 50 characters', () => {
    const payload = {
      owner_id: '100', 
      room_number: '01',
      type: 'a'.repeat(51),
      price: 500000,
      facilities: {
        1: 'sleeping equipment',
        2: 'batthroom'
      }
    }

    expect(() => new RegisterRoom(payload)).toThrowError('REGISTER_ROOM.TYPE_TOO_LONG')
  })

  it('should create correctly with valid payload', () => {
    const payload = {
      owner_id: '100', 
      room_number: '01',
      type: '4 x 5 meter',
      price: 500000,
      facilities: {
        1: 'sleeping equipment',
        2: 'batthroom'
      }
    }


    const registerRoom = new RegisterRoom(payload)

    expect(registerRoom.owner_id).toBe(payload.owner_id)
    expect(registerRoom.room_number).toBe(payload.room_number)
    expect(registerRoom.type).toBe(payload.type)
    expect(registerRoom.price).toBe(payload.price)
    expect(registerRoom.facilities).toBe(payload.facilities)
  })

  it('should create correctly with valid payload without facilities', () => {
    const payload = {
      owner_id: '100',
      room_number: '01',
      type: '4 x 5 meter',
      price: 500000,
    // no facilities
    }

    const registerRoom = new RegisterRoom(payload)

    expect(registerRoom.owner_id).toBe(payload.owner_id)
    expect(registerRoom.room_number).toBe(payload.room_number)
    expect(registerRoom.type).toBe(payload.type)
    expect(registerRoom.price).toBe(payload.price)
    expect(registerRoom.facilities).toBeUndefined()
  })
})