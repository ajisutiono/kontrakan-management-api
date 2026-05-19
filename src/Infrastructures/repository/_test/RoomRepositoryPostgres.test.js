import { randomUUID } from 'crypto'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

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
    it('should persist room by id correctly', async() => {
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
})