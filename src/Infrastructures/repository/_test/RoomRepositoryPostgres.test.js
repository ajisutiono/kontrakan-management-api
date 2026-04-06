import { randomUUID } from 'crypto'

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import pool from '../../database/postgres/pool.js'
import RoomRepositoryPostgres from '../RoomRepositoryPostgres.js'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'

describe('RoomRepositoryPostgres', () => {
  afterEach(async () => {
    await RoomsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addRoom function', () => {
    it('should persist room and return registered room correctly without input payload facilities', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      const registerRoom = {
        room_number:'01',
        type: '36/60',
        price: 250000000
      }

      const fakeId = randomUUID()

      const mockIdGenerator = vi.fn().mockReturnValue(fakeId)

      const roomRepositoryPostgres = new RoomRepositoryPostgres({ pool, idGenerator: mockIdGenerator})

      const registeredRoom = await roomRepositoryPostgres.addRoom({
        ...registerRoom,
        owner_id: ownerId   
      })

      expect(registeredRoom).toEqual({
        id: fakeId,
        owner_id: ownerId,
        room_number: '01'
      })
      
      const room = await RoomsTableTestHelper.findRoomById(fakeId)

      expect(room).toBeDefined()
      expect(room.owner_id).toBe(ownerId)
      expect(room.room_number).toBe('01')
    })

    it('should persist room and return registered room correctly with input payload facilities', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      const registerRoom = {
        room_number:'01',
        type: '36/60',
        price: 250000000,
        facilities: {
          1: 'sleeping room',
          2: 'bathroom'
        }
      }

      const fakeId = randomUUID()

      const mockIdGenerator = vi.fn().mockReturnValue(fakeId)

      const roomRepositoryPostgres = new RoomRepositoryPostgres({ pool, idGenerator: mockIdGenerator})

      const registeredRoom = await roomRepositoryPostgres.addRoom({
        ...registerRoom,
        owner_id: ownerId   
      })

      expect(registeredRoom).toEqual({
        id: fakeId,
        owner_id: ownerId,
        room_number: '01'
      })
      
      const room = await RoomsTableTestHelper.findRoomById(fakeId)
      expect(room).toBeDefined()
      expect(room.owner_id).toBe(ownerId)
      expect(room.room_number).toBe('01')
    })
  })
})