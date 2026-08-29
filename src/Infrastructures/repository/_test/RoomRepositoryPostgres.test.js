import { randomUUID } from 'crypto'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import pool from '../../database/postgres/pool.js'
import RoomRepositoryPostgres from '../RoomRepositoryPostgres.js'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js'

describe('RoomRepositoryPostgres', () => {
  afterEach(async () => {
    await RoomsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addRoom function', () => {
    it('should persist room correctly without facilities', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      const fakeId = randomUUID()
      const mockIdGenerator = vi.fn().mockReturnValue(fakeId)

      const repo = new RoomRepositoryPostgres({ pool, idGenerator: mockIdGenerator })

      const result = await repo.addRoom({
        owner_id: ownerId,
        room_number: '01',
        type: '36/60',
        price: 250000000
      })

      expect(result).toEqual({
        id: fakeId,
        owner_id: ownerId,
        room_number: '01'
      })

      const room = await RoomsTableTestHelper.findRoomById(fakeId)
      expect(room).toBeDefined()
    })

    it('should persist room correctly with facilities', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      const fakeId = randomUUID()
      const mockIdGenerator = vi.fn().mockReturnValue(fakeId)

      const repo = new RoomRepositoryPostgres({ pool, idGenerator: mockIdGenerator })

      const result = await repo.addRoom({
        owner_id: ownerId,
        room_number: '01',
        type: '36/60',
        price: 250000000,
        facilities: ['bed', 'bathroom']
      })

      expect(result.id).toBe(fakeId)
    })
  })

  describe('getRooms', () => {

    it('should work correctly with default parameters', async () => {
      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({ userRole: 'owner' })

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
    it('should return only available rooms when status filter is provided', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({ id: ownerId, role: 'owner' })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '01',
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '02',
        status: 'booked'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { status: 'available' }, // 🔥 ini kuncinya
        page: 1,
        limit: 10,
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].status).toBe('available')
      expect(result.total).toBe(1)
    })

    it('should return all rooms for owner', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '01',
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '02',
        status: 'booked'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        userRole: 'owner'
      })

      expect(result.data).toHaveLength(2)
    })

    it('should filter by ownerId', async () => {
      const owner1 = randomUUID()
      const owner2 = randomUUID()

      await UsersTableTestHelper.addUser({
        id: owner1,
        email: `${owner1}@test.com`
      })

      await UsersTableTestHelper.addUser({
        id: owner2,
        email: `${owner2}@test.com`
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: owner1,
        room_number: '01',
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: owner2,
        room_number: '01',
        status: 'available'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { ownerId: owner1 },
        userRole: 'owner'
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].owner_id).toBe(owner1)
    })

    it('should apply minPrice filter', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '01',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '02',
        price: 600000,
        status: 'available'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { minPrice: 500000 },
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(1)
    })

    it('should apply maxPrice filter', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '01',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '02',
        price: 600000,
        status: 'available'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { maxPrice: 300000 },
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(1)
    })

    it('should apply combined filters', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '01',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: ownerId,
        room_number: '02',
        price: 500000,
        status: 'available'
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { ownerId, minPrice: 400000 },
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(1)
    })

    it('should apply pagination correctly', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      for (let i = 1; i <= 10; i++) {
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: String(i).padStart(2, '0'),
          status: 'available'
        })
      }

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        page: 2,
        limit: 5,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(5)
      expect(result.totalPages).toBe(2)
    })

    it('should return empty when no data match', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`
      })

      const repo = new RoomRepositoryPostgres({ pool })

      const result = await repo.getRooms({
        filters: { minPrice: 99999999 },
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(0)
    })

  })

  describe('getRoomById', () => {
    it('should persist room by id correctly', async () => {
      const ownerId = randomUUID()
      const roomId = randomUUID()

      await UsersTableTestHelper.addUser({ id: ownerId })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        room_number: '01',
      })

      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.getRoomById(roomId)

      expect(result).toHaveProperty('id', roomId)
      expect(result).toHaveProperty('owner_id', ownerId)
      expect(result).toHaveProperty('room_number', '01')
    })

    it('should throw NotFoundError when room not found', async () => {
      const roomId = randomUUID()

      const repository = new RoomRepositoryPostgres({ pool })

      await expect(repository.getRoomById(roomId))
        .rejects.toThrow(NotFoundError)
    })
  })

  describe('updateRoomById', () => {
    let ownerId
    let roomId

    beforeEach(async () => {
      ownerId = randomUUID()
      roomId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        role: 'owner',
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        room_number: '01',
        type: '36/60',
        price: 250000,
        facilities: ['bed', 'bathroom'],
        status: 'available'
      })
    })

    /*
         1. should update room_number only
            - seed room dengan room_number '01'
            - update hanya room_number → '02'
            - assert: room_number berubah jadi '02'
            - assert: field lain (type, price, status) tidak berubah
    */
    it('should update room_number only', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, { room_number: '02' })

      expect(result).toHaveProperty('room_number', '02')
      expect(result).toHaveProperty('type', '36/60')        // tidak berubah
      expect(result).toHaveProperty('price', 250000)   // tidak berubah
      expect(result).toHaveProperty('status', 'available')  // tidak berubah
      expect(result).toHaveProperty('facilities', ['bed', 'bathroom'])  // tidak berubah
    })

    /*  2. should update type only 
        - seed room dengan type 36/60
        - update hanya type → 36/72
        - assert: type berubah jadi 36/72
        - assert: field lain tidak berubah 
    */

    it('should update type only', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, { type: '36/72' })

      expect(result).toHaveProperty('room_number', '01') // tidak berubah
      expect(result).toHaveProperty('type', '36/72')
      expect(result).toHaveProperty('price', 250000)   // tidak berubah
      expect(result).toHaveProperty('status', 'available')  // tidak berubah
      expect(result).toHaveProperty('facilities', ['bed', 'bathroom'])  // tidak berubah

    })

    /*  3. should update price only 
        - seed room dengan price 250000
        - update hanya price → 500000
        - assert: price berubah jadi 500000
        - assert: field lain tidak berubah 
    */
    it('should update price only', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, { price: 500000 })

      expect(result).toHaveProperty('room_number', '01') // tidak berubah
      expect(result).toHaveProperty('type', '36/60')    // tidak berubah
      expect(result).toHaveProperty('price', 500000)
      expect(result).toHaveProperty('status', 'available')  // tidak berubah
      expect(result).toHaveProperty('facilities', ['bed', 'bathroom'])  // tidak berubah
    })

    /*   4. should update status only
         - seed room dengan status 'available'
         - update hanya status → 'booked'
         - assert: status berubah jadi 'booked' 
    */

    it('should update status only', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, { status: 'booked' })

      expect(result).toHaveProperty('room_number', '01') // tidak berubah
      expect(result).toHaveProperty('type', '36/60')     // tidak berubah
      expect(result).toHaveProperty('price', 250000)   // tidak berubah
      expect(result).toHaveProperty('status', 'booked')
      expect(result).toHaveProperty('facilities', ['bed', 'bathroom'])  // tidak berubah
    })

    /*   5. should update facilities only
         - seed room tanpa facilities
         - update hanya facilities → ['AC', 'bathroom']
         - assert: facilities berubah 
    */
    it('should update facilities only', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, { facilities: ['AC', 'bathroom'] })

      expect(result).toHaveProperty('room_number', '01') // tidak berubah
      expect(result).toHaveProperty('type', '36/60')     // tidak berubah
      expect(result).toHaveProperty('price', 250000)   // tidak berubah
      expect(result).toHaveProperty('status', 'available') // tidak berubah
      expect(result).toHaveProperty('facilities', ['AC', 'bathroom'])
    })

    /*  6. should update multiple fields at once
        - seed room dengan data awal
        - update room_number, price, dan status sekaligus
        - assert: semua field yang diupdate berubah
        - assert: field yang tidak diupdate tetap sama 
    */
    it('should update multiple fields at once', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, {
        room_number: '02',
        price: 500000,
        status: 'booked'
      })

      expect(result).toHaveProperty('room_number', '02')
      expect(result).toHaveProperty('type', '36/60')
      expect(result).toHaveProperty('price', 500000)
      expect(result).toHaveProperty('status', 'booked')
      expect(result).toHaveProperty('facilities', ['bed', 'bathroom'])
    })

    /*   6. should return correct fields after update
         - assert: result mengandung id, owner_id, room_number, type, price, facilities, status, updated_at 
    */

    it('should return correct fields after update', async () => {
      const repository = new RoomRepositoryPostgres({ pool })

      const result = await repository.updateRoomById(roomId, {
        room_number: '02',
        type: '36/72',
        price: 500000,
        facilities: ['AC', 'bathroom'],
        status: 'booked'
      })

      expect(result).toHaveProperty('room_number', '02')
      expect(result).toHaveProperty('type', '36/72')
      expect(result).toHaveProperty('price', 500000)
      expect(result).toHaveProperty('status', 'booked')
      expect(result).toHaveProperty('facilities', ['AC', 'bathroom'])
      expect(result).toHaveProperty('updated_at')
      expect(result.updated_at).toBeInstanceOf(Date)
    })

  })

  describe('deleteRoomById', () => {
    it('should delete room correctly', async () => {
      const ownerId = randomUUID()
      const roomId = randomUUID()

      await UsersTableTestHelper.addUser({ id: ownerId, role: 'owner' })
      await RoomsTableTestHelper.addRoom({ id: roomId, owner_id: ownerId })

      const repository = new RoomRepositoryPostgres({ pool })

      await repository.deleteRoomById(roomId)

      const deletedRoom = await RoomsTableTestHelper.findRoomById(roomId)
      expect(deletedRoom).toBeUndefined()
    })
  })
})