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
    })
  })
})