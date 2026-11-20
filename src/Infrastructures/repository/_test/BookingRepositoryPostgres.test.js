import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'crypto'

import pool from '../../database/postgres/pool.js'
import BookingsTableTestHelper from '../../../../tests/BookingsTableTestHelper.js'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import BookingRepositoryPostgres from '../BookingRespositoryPostgres.js'
import InvariantError from '../../../Commons/exceptions/InvariantError.js'

describe('BookingRepositoryPostgres', () => {
  afterEach(async () => {
    await BookingsTableTestHelper.cleanTable()
    await RoomsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addBooking function', () => {
    it('should add booking correctly and set room status to booked', async () => {
      const roomId = randomUUID()
      const ownerId = randomUUID()
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner',
      })

      await UsersTableTestHelper.addUser({
        id: tenantId,
        email: `${tenantId}@test.com`,
        role: 'tenant',
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        status: 'available',
      })

      const bookingId = randomUUID()
      const mockIdGenerator = vi.fn().mockReturnValue(bookingId)

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({
        pool,
        idGenerator: mockIdGenerator,
      })

      const result = await bookingRepositoryPostgres.addBooking({
        room_id: roomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
      })

      expect(result).toEqual({
        id: bookingId,
        room_id: roomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
        status: 'active',
      })

      const booking = await BookingsTableTestHelper.findBookingById(bookingId)
      expect(booking).toBeDefined()

      // status kamar harus ikut berubah
      const room = await RoomsTableTestHelper.findRoomById(roomId)
      expect(room.status).toBe('booked')
    })

    it('should throw InvariantError when room does not exist', async () => {
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: tenantId,
        email: `${tenantId}@test.com`,
        role: 'tenant',
      })

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({ pool })

      await expect(bookingRepositoryPostgres.addBooking({
        room_id: randomUUID(),
        tenant_id: tenantId,
        start_date: '2026-09-04',
      })).rejects.toThrow(InvariantError)
    })

    it('should throw InvariantError and not create booking when room is already booked', async () => {
      const roomId = randomUUID()
      const ownerId = randomUUID()
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner',
      })

      await UsersTableTestHelper.addUser({
        id: tenantId,
        email: `${tenantId}@test.com`,
        role: 'tenant',
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        status: 'booked',
      })

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({ pool })

      await expect(bookingRepositoryPostgres.addBooking({
        room_id: roomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
      })).rejects.toThrow(InvariantError)

      const bookings = await BookingsTableTestHelper.findBookingsByRoomId(roomId)
      expect(bookings).toHaveLength(0)
    })

    it('should not change room status when tenant does not exist', async () => {
      const roomId = randomUUID()
      const ownerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner',
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        status: 'available',
      })

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({ pool })

      await expect(bookingRepositoryPostgres.addBooking({
        room_id: roomId,
        tenant_id: randomUUID(), // tenant tidak ada -> foreign key error
        start_date: '2026-09-04',
      })).rejects.toThrow()

      // kamar harus tetap available, karena seluruh query dibatalkan
      const room = await RoomsTableTestHelper.findRoomById(roomId)
      expect(room.status).toBe('available')
    })
  })

  describe('getBookings function', () => {
    /*
    Data seed (dibuat ulang sebelum setiap test):

    owner A: room A1 ('01'), room A2 ('02')
    owner B: room B1 ('01')

    tenant 1: booking di A1 (active), booking di B1 (cancelled)
    tenant 2: booking di A2 (active), booking di A1 (cancelled)

    Total 4 booking:
    - tenantId  tenant1 -> 2,  tenant2 -> 2
    - ownerId   ownerA  -> 3,  ownerB  -> 1
    - status    active  -> 2,  cancelled -> 2
    - roomId    roomA1  -> 2
    */
    let ownerAId
    let ownerBId
    let tenant1Id
    let tenant2Id
    let roomA1Id

    beforeEach(async () => {
      ownerAId = randomUUID()
      ownerBId = randomUUID()
      tenant1Id = randomUUID()
      tenant2Id = randomUUID()

      const roomA1 = randomUUID()
      roomA1Id = roomA1
      const roomA2 = randomUUID()
      const roomB1 = randomUUID()

      await UsersTableTestHelper.addUser({ id: ownerAId, email: `${ownerAId}@test.com`, role: 'owner' })
      await UsersTableTestHelper.addUser({ id: ownerBId, email: `${ownerBId}@test.com`, role: 'owner' })
      await UsersTableTestHelper.addUser({ id: tenant1Id, name: 'Tenant One', email: `${tenant1Id}@test.com`, role: 'tenant' })
      await UsersTableTestHelper.addUser({ id: tenant2Id, name: 'Tenant Two', email: `${tenant2Id}@test.com`, role: 'tenant' })

      await RoomsTableTestHelper.addRoom({ id: roomA1, owner_id: ownerAId, room_number: '01', price: 250000 })
      await RoomsTableTestHelper.addRoom({ id: roomA2, owner_id: ownerAId, room_number: '02', price: 300000 })
      await RoomsTableTestHelper.addRoom({ id: roomB1, owner_id: ownerBId, room_number: '01', price: 400000 })

      await BookingsTableTestHelper.addBooking({ room_id: roomA1, tenant_id: tenant1Id, start_date: '2026-10-01', status: 'active' })
      await BookingsTableTestHelper.addBooking({ room_id: roomB1, tenant_id: tenant1Id, start_date: '2026-10-02', status: 'cancelled' })
      await BookingsTableTestHelper.addBooking({ room_id: roomA2, tenant_id: tenant2Id, start_date: '2026-10-03', status: 'active' })
      await BookingsTableTestHelper.addBooking({ room_id: roomA1, tenant_id: tenant2Id, start_date: '2026-10-04', status: 'cancelled' })
    })

    it('should return bookings filtered by tenantId', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const result = await repository.getBookings({ filters: { tenantId: tenant1Id } })

      expect(result.data).toHaveLength(2)
      result.data.forEach((booking) => {
        expect(booking.tenant_id).toBe(tenant1Id)
        expect(booking.tenant_name).toBe('Tenant One')
      })
      expect(result.total).toBe(2)
    })

    it('should return only bookings in rooms owned by ownerId', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const resultA = await repository.getBookings({ filters: { ownerId: ownerAId } })
      const resultB = await repository.getBookings({ filters: { ownerId: ownerBId } })

      expect(resultA.data).toHaveLength(3)
      expect(resultA.total).toBe(3)
      expect(resultB.data).toHaveLength(1)
      expect(resultB.total).toBe(1)
    })

    it('should filter bookings by status', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const active = await repository.getBookings({ filters: { status: 'active' } })
      const cancelled = await repository.getBookings({ filters: { status: 'cancelled' } })

      expect(active.data).toHaveLength(2)
      active.data.forEach((booking) => expect(booking.status).toBe('active'))

      expect(cancelled.data).toHaveLength(2)
      cancelled.data.forEach((booking) => expect(booking.status).toBe('cancelled'))
    })

    it('should filter bookings by roomId', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const result = await repository.getBookings({ filters: { roomId: roomA1Id } })

      // room A1 punya 2 booking: tenant 1 (active) dan tenant 2 (cancelled)
      expect(result.data).toHaveLength(2)
      result.data.forEach((booking) => {
        expect(booking.room_id).toBe(roomA1Id)
      })
      expect(result.total).toBe(2)
    })

    it('should return room info and formatted fields', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const result = await repository.getBookings({
        filters: { tenantId: tenant2Id, status: 'active' },
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        room_number: '02',
        price: 300000,
        start_date: '2026-10-03',
        status: 'active',
      })
    })

    it('should return correct pagination metadata', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const page1 = await repository.getBookings({ page: 1, limit: 3 })
      const page2 = await repository.getBookings({ page: 2, limit: 3 })

      expect(page1.data).toHaveLength(3)
      expect(page1.page).toBe(1)
      expect(page1.limit).toBe(3)
      expect(page1.total).toBe(4)
      expect(page1.totalPages).toBe(2)

      expect(page2.data).toHaveLength(1)

      const page1Ids = page1.data.map((booking) => booking.id)
      page2.data.forEach((booking) => {
        expect(page1Ids).not.toContain(booking.id)
      })
    })

    it('should return empty data when no bookings found', async () => {
      const repository = new BookingRepositoryPostgres({ pool })

      const result = await repository.getBookings({ filters: { tenantId: randomUUID() } })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })
  })
})