import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import BookingsTableTestHelper from '../../../../tests/BookingsTableTestHelper.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('Bookings API', () => {
  const server = createServer(container)

  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await BookingsTableTestHelper.cleanTable()
    await RoomsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /api/bookings', () => {
    let tenantAccessToken
    let ownerId
    let roomId

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)
      ownerId = randomUUID()
      roomId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: ownerId,
        name: 'Owner Name',
        email: 'owner@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      await RoomsTableTestHelper.addRoom({
        id: roomId,
        owner_id: ownerId,
        room_number: '01',
        type: '36/60',
        price: 250000,
        status: 'available',
      })

      await UsersTableTestHelper.addUser({
        name: 'Tenant Name',
        email: 'tenant@mail.com',
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'tenant@mail.com', password: 'Password1!' })

      tenantAccessToken = loginResponse.body.data.accessToken
    })

    // AUTHENTICATION
    describe('authentication', () => {
      it('should response 401 when no access token provided', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .send({
            room_id: roomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(401)
      })

      it('should response 401 when access token is invalid', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', 'Bearer invalid_token')
          .send({
            room_id: roomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(401)
      })
    })

    // AUTHORIZATION
    describe('authorization', () => {
      it('should response 403 when role is owner', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          name: 'Another Owner',
          email: 'anotherowner@mail.com',
          password: hashedPassword,
          role: 'owner',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'anotherowner@mail.com', password: 'Password1!' })

        const ownerAccessToken = loginResponse.body.data.accessToken

        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${ownerAccessToken}`)
          .send({
            room_id: roomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(403)
      })
    })

    // VALIDATION
    describe('validation', () => {
      it('should response 400 when room_id is missing', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(400)
      })

      it('should response 400 when start_date is missing', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: roomId,
          })

        expect(response.status).toBe(400)
      })

      it('should response 400 when start_date is invalid format', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: roomId,
            start_date: 'not-a-date',
          })

        expect(response.status).toBe(400)
      })
    })

    // NOT FOUND
    describe('not found', () => {
      it('should response 404 when room not found', async () => {
        const fakeRoomId = randomUUID()

        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: fakeRoomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(404)
      })
    })

    // BUSINESS RULE
    describe('business rule', () => {
      it('should response 400 when room is not available', async () => {
        const bookedRoomId = randomUUID()

        await RoomsTableTestHelper.addRoom({
          id: bookedRoomId,
          owner_id: ownerId,
          room_number: '02',
          type: '36/60',
          price: 250000,
          status: 'booked',
        })

        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: bookedRoomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(400)
      })
    })

    // SUCCESS
    describe('success response', () => {
      it('should response 201 and return booking data', async () => {
        const response = await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: roomId,
            start_date: '2026-10-01',
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('room_id', roomId)
        expect(response.body.data).toHaveProperty('start_date', '2026-10-01')
        expect(response.body.data).toHaveProperty('status', 'active')
      })

      it('should set room status to booked after booking is created', async () => {
        await request(server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantAccessToken}`)
          .send({
            room_id: roomId,
            start_date: '2026-10-01',
          })

        const room = await RoomsTableTestHelper.findRoomById(roomId)
        expect(room.status).toBe('booked')
      })
    })
  })

  describe('when GET /api/me/bookings', () => {
    /*
    Data seed (dibuat ulang sebelum setiap test):

    owner A: room A1 ('01'), room A2 ('02')
    owner B: room B1 ('01')

    tenant 1: booking di A1 (active), booking di B1 (cancelled)
    tenant 2: booking di A2 (active), booking di A1 (cancelled)

    Hasil yang diharapkan:
    - tenant 1 -> 2 booking,  tenant 2 -> 2 booking
    - owner A  -> 3 booking,  owner B  -> 1 booking
    */
    let ownerAId
    let ownerBId
    let tenant1Id
    let tenant2Id
    let roomA1Id
    let roomA2Id
    let roomB1Id

    const login = async (email) => {
      const response = await request(server)
        .post('/api/authentications')
        .send({ email, password: 'Password1!' })

      return response.body.data.accessToken
    }

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      ownerAId = randomUUID()
      ownerBId = randomUUID()
      tenant1Id = randomUUID()
      tenant2Id = randomUUID()
      roomA1Id = randomUUID()
      roomA2Id = randomUUID()
      roomB1Id = randomUUID()

      await UsersTableTestHelper.addUser({ id: ownerAId, name: 'Owner A', email: 'ownera@mail.com', password: hashedPassword, role: 'owner' })
      await UsersTableTestHelper.addUser({ id: ownerBId, name: 'Owner B', email: 'ownerb@mail.com', password: hashedPassword, role: 'owner' })
      await UsersTableTestHelper.addUser({ id: tenant1Id, name: 'Tenant One', email: 'tenant1@mail.com', password: hashedPassword, role: 'tenant' })
      await UsersTableTestHelper.addUser({ id: tenant2Id, name: 'Tenant Two', email: 'tenant2@mail.com', password: hashedPassword, role: 'tenant' })

      await RoomsTableTestHelper.addRoom({ id: roomA1Id, owner_id: ownerAId, room_number: '01', price: 250000 })
      await RoomsTableTestHelper.addRoom({ id: roomA2Id, owner_id: ownerAId, room_number: '02', price: 300000 })
      await RoomsTableTestHelper.addRoom({ id: roomB1Id, owner_id: ownerBId, room_number: '01', price: 400000 })

      await BookingsTableTestHelper.addBooking({ room_id: roomA1Id, tenant_id: tenant1Id, start_date: '2026-10-01', status: 'active' })
      await BookingsTableTestHelper.addBooking({ room_id: roomB1Id, tenant_id: tenant1Id, start_date: '2026-10-02', status: 'cancelled' })
      await BookingsTableTestHelper.addBooking({ room_id: roomA2Id, tenant_id: tenant2Id, start_date: '2026-10-03', status: 'active' })
      await BookingsTableTestHelper.addBooking({ room_id: roomA1Id, tenant_id: tenant2Id, start_date: '2026-10-04', status: 'cancelled' })
    })

    // AUTHENTICATION
    describe('authentication', () => {
      it('should response 401 when no access token provided', async () => {
        const response = await request(server)
          .get('/api/me/bookings')

        expect(response.status).toBe(401)
      })

      it('should response 401 when access token is invalid', async () => {
        const response = await request(server)
          .get('/api/me/bookings')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)
      })
    })

    // SUCCESS RESPONSE
    describe('success response', () => {
      it('should response 200 and return only own bookings for tenant', async () => {
        const accessToken = await login('tenant1@mail.com')

        const response = await request(server)
          .get('/api/me/bookings')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((booking) => {
          expect(booking.tenant_id).toBe(tenant1Id)
        })

        expect(response.body.meta.pagination.total).toBe(2)
      })

      it('should response 200 and return only bookings in own rooms for owner', async () => {
        const accessToken = await login('ownera@mail.com')

        const response = await request(server)
          .get('/api/me/bookings')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)

        response.body.data.forEach((booking) => {
          expect([roomA1Id, roomA2Id]).toContain(booking.room_id)
        })

        expect(response.body.meta.pagination.total).toBe(3)
      })

      it('should not return bookings from rooms owned by another owner', async () => {
        const accessToken = await login('ownerb@mail.com')

        const response = await request(server)
          .get('/api/me/bookings')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].room_id).toBe(roomB1Id)
      })

      it('should response 200 and return empty data when user has no bookings', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: randomUUID(),
          name: 'Tenant Three',
          email: 'tenant3@mail.com',
          password: hashedPassword,
          role: 'tenant',
        })

        const accessToken = await login('tenant3@mail.com')

        const response = await request(server)
          .get('/api/me/bookings')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual([])
        expect(response.body.meta.pagination.total).toBe(0)
        expect(response.body.meta.pagination.totalPages).toBe(0)
      })
    })

    // FILTERING
    describe('filtering', () => {
      it('should return only active bookings when status is active', async () => {
        const accessToken = await login('tenant1@mail.com')

        const response = await request(server)
          .get('/api/me/bookings?status=active')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].status).toBe('active')
      })

      it('should return only cancelled bookings when status is cancelled', async () => {
        const accessToken = await login('tenant1@mail.com')

        const response = await request(server)
          .get('/api/me/bookings?status=cancelled')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].status).toBe('cancelled')
      })

      it('should return only bookings of the given room when roomId is provided', async () => {
        const accessToken = await login('ownera@mail.com')

        const response = await request(server)
          .get(`/api/me/bookings?roomId=${roomA1Id}`)
          .set('Authorization', `Bearer ${accessToken}`)

        // room A1 punya 2 booking: tenant 1 (active) dan tenant 2 (cancelled)
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
        response.body.data.forEach((booking) => {
          expect(booking.room_id).toBe(roomA1Id)
        })
      })
    })

    // PAGINATION
    describe('pagination', () => {
      it('should return limited number of bookings and correct metadata', async () => {
        const accessToken = await login('ownera@mail.com')

        const response = await request(server)
          .get('/api/me/bookings?page=1&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
        expect(response.body.meta.pagination).toEqual({
          page: 1,
          limit: 2,
          total: 3,
          totalPages: 2,
        })
      })

      it('should return the remaining bookings on page 2 without overlap', async () => {
        const accessToken = await login('ownera@mail.com')

        const page1 = await request(server)
          .get('/api/me/bookings?page=1&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        const page2 = await request(server)
          .get('/api/me/bookings?page=2&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(page2.status).toBe(200)
        expect(page2.body.data).toHaveLength(1)

        const page1Ids = page1.body.data.map((booking) => booking.id)
        page2.body.data.forEach((booking) => {
          expect(page1Ids).not.toContain(booking.id)
        })
      })
    })
  })
})