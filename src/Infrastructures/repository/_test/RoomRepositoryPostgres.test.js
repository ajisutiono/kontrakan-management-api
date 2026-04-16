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

  describe('getRooms function', () => {

    it('should work correctly when called with minimal arguments (default parameters)', async () => {
      const roomRepositoryPostgres = new RoomRepositoryPostgres({ pool })
  
      const result = await roomRepositoryPostgres.getRooms({ userRole: 'owner' })

      expect(result.data).toBeDefined()
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
    
    /*
    Scenarios:
    1. should return all available rooms for tenant
    2. should return all rooms for owner
    3. should return available rooms filtered by ownerId for tenant
    4. should return only rooms owned by owner when ownerId is provided
    5. should return rooms with price greater than or equal to minPrice
    6. should return rooms with price less than or equal to maxPrice
    7. should return rooms within minPrice and maxPrice range
    8. should combine filters correctly (ownerId + minPrice + maxPrice + status)
    9. should return limited number of rooms based on limit
    10.should return correct rooms based on page and limit
    11.should return correct total count of filtered rooms
    12.should return empty data when no rooms match filters
    13.should return empty data when page exceeds totalPages
    14.should return all rooms without any WHERE clause when role is owner and no filters provided
    */

    it('should return all available rooms for tenant', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(2)

      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })

      expect(result.total).toBe(2)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)

    })

    it('should return all rooms for ownner', async() => {
      const ownerId = randomUUID()

      const owner = await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })


      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { ownerId: owner},
        page: 1,
        limit: 10,
        userRole: 'owner'
      })

      expect(result.data).toHaveLength(3)

      const statuses = result.data.map(room => room.status)

      expect(statuses).toEqual(expect.arrayContaining(['available', 'available', 'booked']))

      expect(result.total).toBe(3)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return available rooms filtered by ownerId for tenant', async() => {
      const ownerId1 = randomUUID()
      const ownerId2 = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId1,
        email: `${ownerId1}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: ownerId2,
        email: `${ownerId2}@test.com`,
        role: 'owner'
      })

      // rooms owner1
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      // rooms owner2
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(4)
    
      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })

      expect(result.total).toBe(4)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return only rooms owned by owner when ownerId is provided', async() => {
      const ownerId1 = randomUUID()
      const ownerId2 = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId1,
        email: `${ownerId1}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: ownerId2,
        email: `${ownerId2}@test.com`,
        role: 'owner'
      })

      // rooms owner1
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      // rooms owner2
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'booked'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { ownerId: ownerId1 },
        page: 1,
        limit: 10,
        userRole: 'owner'
      })

      expect(result.data).toHaveLength(3)
    
   
      const statuses = result.data.map(room => room.status)

      expect(statuses).toEqual(expect.arrayContaining(['available', 'available', 'booked']))


      expect(result.total).toBe(3)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return rooms with price greater than or equal to minPrice', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '04',
        type: '36/72',
        price: 1000000,
        status: 'available'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { minPrice: 600000 },
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      // room_number 01 tidak termasuk karena price kurang dari 600000
      // jadi hanya 2 data yang ditampilkan
      expect(result.data).toHaveLength(3)
      
      const minPrice = 600000

      result.data.forEach((room) => {
        expect(room.price).toBeGreaterThanOrEqual(minPrice)
      })
    
      expect(result.total).toBe(3)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return rooms with price less than or equal to maxPrice', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '02',
        type: '32/60',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '03',
        type: '32/60',
        price: 650000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId,
        room_number: '04',
        type: '36/72',
        price: 1000000,
        status: 'available'
      })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { maxPrice: 1000000 },
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      // semua data dtampilkan karena memenuhi maxPrice
      expect(result.data).toHaveLength(4)
      
      const maxPrice = 1000000

      result.data.forEach((room) => {
        expect(room.price).toBeLessThanOrEqual(maxPrice)
      })
    
      expect(result.total).toBe(4)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return rooms within minPrice and maxPrice range', async() => {
      const ownerId1 = randomUUID()
      const ownerId2 = randomUUID()


      await UsersTableTestHelper.addUser({
        id: ownerId1,
        email: `${ownerId1}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: ownerId2,
        email: `${ownerId2}@test.com`,
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '02',
        type: '32/60',
        price: 400000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '03',
        type: '32/60',
        price: 500000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '04',
        type: '36/72',
        price: 600000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '01',
        type: '36/72',
        price: 1000000,
        status: 'available'
      })


      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { minPrice: 400000, maxPrice: 1000000 },
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      // semua data dtampilkan karena memenuhi antara minPrice dan maxPrice
      expect(result.data).toHaveLength(4)
      
      const minPrice = 400000
      const maxPrice = 1000000

      result.data.forEach((room) => {
        expect(room.price).toBeGreaterThanOrEqual(minPrice)
        expect(room.price).toBeLessThanOrEqual(maxPrice)
      })
    
      expect(result.total).toBe(4)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should combine filters correctly (ownerId + minPrice + maxPrice + status)', async() => {
      const ownerId1 = randomUUID()
      const ownerId2 = randomUUID()


      await UsersTableTestHelper.addUser({
        id: ownerId1,
        email: `${ownerId1}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: ownerId2,
        email: `${ownerId2}@test.com`,
        role: 'owner'
      })
      
      // rooms ownerId1
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '01',
        type: '30/60',
        price: 300000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '02',
        type: '32/60',
        price: 400000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '03',
        type: '32/60',
        price: 500000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId1,
        room_number: '04',
        type: '36/72',
        price: 600000,
        status: 'booked'
      })

      // rooms ownerId2
      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '01',
        type: '36/72',
        price: 1000000,
        status: 'available'
      })

      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '02',
        type: '36/72',
        price: 1500000,
        status: 'available'
      })


      await RoomsTableTestHelper.addRoom({ 
        owner_id: ownerId2,
        room_number: '03',
        type: '36/72',
        price: 800000,
        status: 'booked'
      })


      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { ownerId: ownerId2, minPrice: 400000, maxPrice: 1000000 },
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      // data yang ditampilkan hanya milik ownerId2, dan yang memenuhi minPrice, maxPrice, dan status available  hanya 1 data karena yang get adalah tenant
      expect(result.data).toHaveLength(1)
      
      const minPrice = 400000
      const maxPrice = 1000000

      result.data.forEach((room) => {
        expect(room.owner_id).toBe(ownerId2)
        expect(room.price).toBeGreaterThanOrEqual(minPrice)
        expect(room.price).toBeLessThanOrEqual(maxPrice)
        expect(room.status).toBe('available')
      })
    
      expect(result.total).toBe(1)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should return limited number of rooms based on limit', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      for (let i = 1; i <= 30; i++) {
        const formattedRoomNumber = String(i).padStart(2, '0')

        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId,
          room_number: formattedRoomNumber,
          type: '30/60',
          price: 300000,
          status: 'available'
        })
      }
     
      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(10)
      
      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })
    
      expect(result.total).toBe(30)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(3)
    })

    it('should return correct rooms based on page and limit', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      for (let i = 1; i <= 10; i++) {
        const formattedRoomNumber = String(i).padStart(2, '0')

        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId,
          room_number: formattedRoomNumber,
          type: '30/60',
          price: 300000,
          status: 'available'
        })
      }
     
      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        page: 2,
        limit: 5,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(5)
      
      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })

      const lastIndex = result.data.length - 1
      expect(result.data[lastIndex].room_number).toBe('01')
    
      expect(result.total).toBe(10)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
      expect(result.totalPages).toBe(2)
    })

    it('should return correct total count of filtered rooms', async() => {
      const ownerId1 = randomUUID()
      const ownerId2 = randomUUID()


      await UsersTableTestHelper.addUser({
        id: ownerId1,
        email: `${ownerId1}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: ownerId2,
        email: `${ownerId2}@test.com`,
        role: 'owner'
      })

      for (let i = 1; i <= 5; i++) {
        const formattedRoomNumber = String(i).padStart(2, '0')

        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId1,
          room_number: formattedRoomNumber,
          type: '30/60',
          price: 300000,
          status: 'available'
        })
      }

      for (let i = 1; i <= 6; i++) {
        const formattedRoomNumber = String(i).padStart(2, '0')

        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId2,
          room_number: formattedRoomNumber,
          type: '30/60',
          price: 400000,
          status: 'available'
        })
      }
     
      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: { ownerId: ownerId1, minPrice: 100000, maxPrice: 500000},
        page: 1,
        limit: 4,
        userRole: 'owner'
      })

      expect(result.data).toHaveLength(4)
      
      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })
    
      expect(result.total).toBe(5)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(4)
      expect(result.totalPages).toBe(2)
    })


    it('should return empty data when no rooms match filters', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      for (let i = 1; i <= 10; i++) {
        const formattedRoomNumber = String(i).padStart(2, '0')

        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId,
          room_number: formattedRoomNumber,
          type: '30/60',
          price: 300000,
          status: 'available'
        })
      }
     
      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {  minPrice: 500000, maxPrice: 1000000},
        page: 1,
        limit: 10,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(0)
      
      result.data.forEach((room) => {
        expect(room.status).toBe('available')
      })
    
      expect(result.total).toBe(0)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(0)
    })

    it('should return empty data when page exceeds totalPages', async() => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      for (let i = 1; i <= 5; i++) {
        await RoomsTableTestHelper.addRoom({ 
          owner_id: ownerId,
          room_number: String(i).padStart(2, '0'),
          status: 'available'
        })
      }
     
      const roomRepositoryPostgres = new RoomRepositoryPostgres({pool})

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        page: 2,
        limit: 5,
        userRole: 'tenant'
      })

      expect(result.data).toHaveLength(0)
      
      expect(result.total).toBe(5)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
      expect(result.totalPages).toBe(1)
    })

    it('should return all rooms without any WHERE clause when role is owner and no filters provided', async () => {
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: 'owner@test.com',
        role: 'owner'
      })

      await RoomsTableTestHelper.addRoom({ owner_id: ownerId })

      const roomRepositoryPostgres = new RoomRepositoryPostgres({ pool })

      const result = await roomRepositoryPostgres.getRooms({
        filters: {},
        userRole: 'owner',
        page: 1,
        limit: 10
      })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })
})