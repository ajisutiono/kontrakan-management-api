import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'crypto'

import pool from '../../database/postgres/pool'
import BookingsTableTestHelper from '../../../../tests/BookingsTableTestHelper'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import BookingRepositoryPostgres from '../BookingRespositoryPostgres'



describe('BookingRepositoryPostgres', () => {
  afterEach(async() => {
    await BookingsTableTestHelper.cleanTable()
    await RoomsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async() => {
    await pool.end()
  })

  describe('AddBooking function', () => {
    /*
    1. should add booking correctly and return booking data
   - seed: a user (tenant) and a room (available)
   - insert booking with room_id, tenant_id, start_date
   - assert: result has id, room_id, tenant_id, start_date, status
   - assert: status is 'active'

    2. should throw error when room_id does not exist
   - insert booking with fake room_id (not in DB)
   - assert: throws an error (foreign key constraint)
   */
    it('should add booking correctly and return booking data', async() => {
      const roomId = randomUUID()
      const ownerId = randomUUID()
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        email: `${ownerId}@test.com`,
        role: 'owner'
      })

      await UsersTableTestHelper.addUser({
        id: tenantId, 
        email: `${tenantId}@test.com`,
        role: 'tenant'
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        status: 'available'
      })

      const bookingId = randomUUID()
      const mockIdGenerator = vi.fn().mockReturnValue(bookingId)

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({ pool, idGenerator: mockIdGenerator})

      const result = await bookingRepositoryPostgres.addBooking({
        room_id: roomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
        status: 'active'
      })

      expect(result).toEqual({
        id: bookingId,
        room_id: roomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
        status: 'active'
      })

      const booking = await BookingsTableTestHelper.findBookingById(bookingId)
      expect(booking).toBeDefined()
    })

    it('should throw error when room_id does not exist', async () => {
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: tenantId,
        email: `${tenantId}@test.com`,
        role: 'tenant',
      })

      const bookingRepositoryPostgres = new BookingRepositoryPostgres({ pool })
      const fakeRoomId = randomUUID()

      await expect(bookingRepositoryPostgres.addBooking({
        room_id: fakeRoomId,
        tenant_id: tenantId,
        start_date: '2026-09-04',
      })).rejects.toThrow()
    })
  })
})