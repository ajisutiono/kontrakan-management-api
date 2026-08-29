import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js'
import RoomsTableTestHelper from '../../../../tests/RoomsTableTestHelper.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('Rooms API', () => {
  const server = createServer(container)

  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await RoomsTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /api/rooms', () => {

    it('should response 201 when create new room successfully without facilities', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const requestPayload = {
        room_number: '01',
        type: '30/60',
        price: 6000000,
      }

      const response = await request(server)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('owner_id')
      expect(response.body.data).toHaveProperty('room_number', '01')
    })

    it('should response 201 when create new room successfully with facilities', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const requestPayload = {
        room_number: '01',
        type: '30/60',
        price: 6000000,
        facilities: ['sleeping equipment', 'bathroom'],
      }

      const response = await request(server)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('owner_id')
      expect(response.body.data).toHaveProperty('room_number', '01')
    })

    it('should response 401 when no authorization header', async () => {
      const requestPayload = {
        room_number: '01',
        type: '30/60',
        price: 6000000,
      }

      const response = await request(server)
        .post('/api/rooms')
        .send(requestPayload)

      expect(response.status).toBe(401)
    })

    it('should response 403 when role is not owner', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const requestPayload = {
        room_number: '01',
        type: '30/60',
        price: 6000000,
      }

      const response = await request(server)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload)

      expect(response.status).toBe(403)
    })

    it('should response 400 when request payload is invalid', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const response = await request(server)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})

      expect(response.status).toBe(400)
    })

  })

  describe('when GET /api/rooms', () => {
    /*
Authentication Scenarios
1. should response 401 when no access token provided
2. should response 401 when access token is invalid

Success Scenarios (Public Listing - Only Available Rooms)
3. should response 200 and return only available rooms for tenant
4. should response 200 and return only available rooms for owner (same behavior as tenant)
5. should return available rooms from multiple owners

Filtering Scenarios
6. should response 200 and return available rooms filtered by ownerId
7. should response 200 and return available rooms filtered by minPrice
8. should response 200 and return available rooms filtered by maxPrice
9. should response 200 and return available rooms filtered by minPrice and maxPrice

Pagination Scenarios
10. should response 200 and return limited number of rooms based on limit
11. should response 200 and return correct rooms based on page and limit
12. should response 200 and return correct pagination metadata (page, limit, total, totalPages)

Edge Case
13. should response 200 and return empty data when no rooms found
14. should ignore booked rooms even if they match filters
*/

    describe('authentication', () => {
      // 1.
      it('should response 401 when no access token provided', async () => {

        const response = await request(server)
          .get('/api/rooms')

        expect(response.status).toBe(401)
      })

      // 2.
      it('should response 401 when access token is invalid', async () => {
        const response = await request(server)
          .get('/api/rooms')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)
      })
    })

    describe('success response', () => {
      // 3.
      it('should response 200 and return only available rooms for tenant', async () => {
        const ownerId = randomUUID()

        await UsersTableTestHelper.addUser({ id: ownerId, role: 'owner' })


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
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '03',
          type: '30/60',
          price: 300000,
          status: 'available'
        })



        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          name: 'Tenant Name',
          email: 'tenant@mail.com',
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'tenant@mail.com', password: 'Password1!' })


        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.owner_id).toBe(ownerId)
          expect(room.status).toBe('available')
        })

        expect(response.body.meta.pagination.total).toBe(2)
      })

      // 4.
      it('should response 200 and return only available rooms for owner', async () => {
        const ownerId = randomUUID()
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner Name',
          email: 'owner@mail.com',
          password: hashedPassword,
          role: 'owner',
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
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '03',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'owner@mail.com', password: 'Password1!' })


        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })

        expect(response.body.meta.pagination.total).toBe(2)
      })

      // 5. 
      it('should response 200 and return available rooms from multiple owners', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerA = randomUUID()
        const ownerB = randomUUID()

        // ownerA
        await UsersTableTestHelper.addUser({
          id: ownerA,
          name: 'Owner A',
          email: `${ownerA}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        // ownerB
        await UsersTableTestHelper.addUser({
          id: ownerB,
          name: 'Owner B',
          email: `${ownerB}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })


        // rooms ownerA
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        // rooms ownerB
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })

        const ownerIds = response.body.data.map((room) => room.owner_id)
        expect(ownerIds).toContain(ownerA)
        expect(ownerIds).toContain(ownerB)

        expect(response.body.meta.pagination.total).toBe(2)
      })
    })

    describe('filtering', () => {
      // 6.
      it('should response 200 and return available rooms filtered by ownerId', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerA = randomUUID()
        const ownerB = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerA,
          name: 'Owner A',
          email: `${ownerA}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        await UsersTableTestHelper.addUser({
          id: ownerB,
          name: 'Owner B',
          email: `${ownerB}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })


        // rooms ownerA
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        // rooms ownerB
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${ownerA}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get(`/api/rooms?ownerId=${ownerB}`)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)

        response.body.data.forEach((room) => {
          expect(room.owner_id).toBe(ownerB)
          expect(room.status).toBe('available')
        })

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ owner_id: ownerA }),
          ])
        )

        expect(response.body.meta.pagination.total).toBe(1)
      })

      // 7.
      it('should response 200 and return available rooms filtered by minPrice', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerA = randomUUID()
        const ownerB = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerA,
          name: 'Owner A',
          email: `${ownerA}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        await UsersTableTestHelper.addUser({
          id: ownerB,
          name: 'Owner B',
          email: `${ownerB}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })


        // rooms ownerA
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '02',
          type: '30/60',
          price: 400000,
          status: 'available'
        })

        // rooms ownerB
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '01',
          type: '30/60',
          price: 500000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '03',
          type: '30/60',
          price: 100000,
          status: 'available'
        })

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?minPrice=300000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
          expect(room.price).toBeGreaterThanOrEqual(300000)
        })

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked' }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ price: 100000 }),
          ])
        )

        expect(response.body.meta.pagination.total).toBe(3)
      })

      // 8.
      it('should response 200 and return available rooms filtered by maxPrice', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerA = randomUUID()
        const ownerB = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerA,
          name: 'Owner A',
          email: `${ownerA}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        await UsersTableTestHelper.addUser({
          id: ownerB,
          name: 'Owner B',
          email: `${ownerB}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })


        // rooms ownerA
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '02',
          type: '30/60',
          price: 400000,
          status: 'available'
        })

        // rooms ownerB
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '01',
          type: '30/60',
          price: 500000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '03',
          type: '30/60',
          price: 800000,
          status: 'available'
        })

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?maxPrice=500000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
          expect(room.price).toBeLessThanOrEqual(500000)
        })

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked' }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ price: 800000 }),
          ])
        )

        expect(response.body.meta.pagination.total).toBe(3)
      })

      // 9.
      it('should response 200 and return available rooms filtered by minPrice and maxPrice', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerA = randomUUID()
        const ownerB = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerA,
          name: 'Owner A',
          email: `${ownerA}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        await UsersTableTestHelper.addUser({
          id: ownerB,
          name: 'Owner B',
          email: `${ownerB}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })


        // rooms ownerA
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '02',
          type: '30/60',
          price: 400000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerA,
          room_number: '03',
          type: '30/60',
          price: 200000,
          status: 'available'
        })

        // rooms ownerB
        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '01',
          type: '30/60',
          price: 500000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerB,
          room_number: '03',
          type: '30/60',
          price: 800000,
          status: 'available'
        })

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?minPrice=300000&maxPrice=500000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
          expect(room.price).toBeGreaterThanOrEqual(300000)
          expect(room.price).toBeLessThanOrEqual(500000)
        })

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked' }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ price: 200000, status: 'available' }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ price: 800000, status: 'available' }),
          ])
        )

        expect(response.body.meta.pagination.total).toBe(3)
      })
    })

    describe('pagination', () => {
      // 10.
      it('should response 200 and return limited number of rooms based on limit', async () => {

        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const owner = randomUUID()

        await UsersTableTestHelper.addUser({
          id: owner,
          name: 'Owner',
          email: `${owner}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        for (let i = 1; i <= 10; i++) {
          await RoomsTableTestHelper.addRoom({
            owner_id: owner,
            room_number: String(i).padStart(2, '0'),
            status: 'available'
          })
        }

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?limit=5')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(5)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })

        expect(response.body.meta.pagination.limit).toBe(5)

        const roomNumber = response.body.data.map((room) => room.room_number)
        expect(roomNumber).toContain('10')
        expect(roomNumber).toContain('06')
        expect(response.body.meta.pagination.total).toBe(10)

      })

      // 11.
      it('should response 200 and return correct rooms based on page and limit', async () => {

        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const owner = randomUUID()

        await UsersTableTestHelper.addUser({
          id: owner,
          name: 'Owner',
          email: `${owner}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        for (let i = 1; i <= 10; i++) {
          await RoomsTableTestHelper.addRoom({
            owner_id: owner,
            room_number: String(i).padStart(2, '0'),
            status: 'available'
          })
        }

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?limit=5&page=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(5)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })

        expect(response.body.meta.pagination.page).toBe(2)

        const roomNumber = response.body.data.map((room) => room.room_number)
        expect(roomNumber).toContain('05')
        expect(roomNumber).toContain('01')

        expect(response.body.meta.pagination.limit).toBe(5)
        expect(response.body.meta.pagination.total).toBe(10)

      })

      // 12.
      it('should response 200 and return correct pagination metadata (page, limit, total, totalPages)', async () => {

        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const owner = randomUUID()

        await UsersTableTestHelper.addUser({
          id: owner,
          name: 'Owner',
          email: `${owner}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        for (let i = 1; i <= 20; i++) {
          await RoomsTableTestHelper.addRoom({
            owner_id: owner,
            room_number: String(i).padStart(2, '0'),
            status: 'available'
          })
        }

        // tenant
        const tenantId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: tenantId,
          name: 'Tenant Name',
          email: `${tenantId}@mail.com`,
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/rooms?limit=5&page=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(5)

        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })

        expect(response.body.meta.pagination.limit).toBe(5)
        expect(response.body.meta.pagination.page).toBe(2)

        const roomNumber = response.body.data.map((room) => room.room_number)
        expect(roomNumber).toContain('15')
        expect(roomNumber).toContain('11')

        expect(response.body.meta.pagination.total).toBe(20)
        expect(response.body.meta.pagination.totalPages).toBe(4)
      })
    })

    // 13.
    it('should response 200 and return empty data when no rooms found', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Tenant Name',
        email: 'tenant@mail.com',
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'tenant@mail.com', password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const response = await request(server)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(0)
      expect(response.body.meta.pagination.total).toBe(0)
    })

    // 14.
    it('should ignore booked rooms even if they match filters', async () => {

      const hashedPassword = await bcrypt.hash('Password1!', 10)

      const owner = randomUUID()

      await UsersTableTestHelper.addUser({
        id: owner,
        name: 'Owner',
        email: `${owner}@mail.com`,
        password: hashedPassword,
        role: 'owner',
      })

      await RoomsTableTestHelper.addRoom({
        owner_id: owner,
        room_number: '01',
        status: 'available'
      })

      for (let i = 2; i <= 5; i++) {
        await RoomsTableTestHelper.addRoom({
          owner_id: owner,
          room_number: String(i).padStart(2, '0'),
          status: 'booked'
        })
      }

      // tenant
      const tenantId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: tenantId,
        name: 'Tenant Name',
        email: `${tenantId}@mail.com`,
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: `${tenantId}@mail.com`, password: 'Password1!' })

      const { accessToken } = loginResponse.body.data

      const response = await request(server)
        .get('/api/rooms?status=booked')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)

      response.body.data.forEach((room) => {
        expect(room.status).toBe('available')
      })

      expect(response.body.data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ owner_id: owner, status: 'booked' }),
        ])
      )

      const roomNumber = response.body.data.map((room) => room.room_number)
      expect(roomNumber).toContain('01')

      expect(response.body.meta.pagination.total).toBe(1)
    })
  })

  describe('when GET /api/me/rooms', () => {
    // AUTHENTICATION
    describe('authentication', () => {
      // 1. should response 401 when no access token provided
      it('should response 401 when no access token provided', async () => {

        const response = await request(server)
          .get('/api/me/rooms')

        expect(response.status).toBe(401)
      })

      // 2. should response 401 when access token is invalid
      it('should response 401 when access token is invalid', async () => {
        const response = await request(server)
          .get('/api/me/rooms')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)
      })
    })

    // AUTHORIZATION
    describe('authorization', () => {
      // 3. should response 403 when role is tenant
      //    - login sebagai tenant
      //    - assert: 403
      it('should response 403 when role is tenant', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          name: 'Tenant Name',
          email: 'tenant@mail.com',
          password: hashedPassword,
          role: 'tenant',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'tenant@mail.com', password: 'Password1!' })


        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/me/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(403)
      })
    })

    describe('success response', () => {
      // 4. should response 200 and return all rooms (available + booked) for owner
      //    - seed: 2 available + 1 booked milik owner yang login
      //    - assert: dapat 3 room
      //    - assert: ada yang status 'booked' (berbeda dengan public endpoint)
      it('should response 200 and return all rooms (available + booked) for owner', async () => {
        const ownerId = randomUUID()
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner Name',
          email: 'owner@mail.com',
          password: hashedPassword,
          role: 'owner',
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
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '03',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'owner@mail.com', password: 'Password1!' })


        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/me/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)

        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(3)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 5. should response 200 and return only own rooms, not other owner's rooms
      //    - seed: owner_A punya 2 rooms, owner_B punya 2 rooms
      //    - login sebagai owner_A
      //    - assert: hanya dapat 2 room milik owner_A
      //    - poin: ownerId dari JWT, bukan query
      it('should response 200 and return only own rooms', async () => {
        const owner_A = randomUUID()

        await UsersTableTestHelper.addUser({ id: owner_A, role: 'owner' })

        // room's owner_A
        await RoomsTableTestHelper.addRoom({
          owner_id: owner_A,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: owner_A,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        const owner_B = randomUUID()

        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: owner_B,
          name: 'Owner B',
          email: 'ownerB@mail.com',
          password: hashedPassword,
          role: 'owner',
        })


        // room's owner_B
        await RoomsTableTestHelper.addRoom({
          owner_id: owner_B,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: owner_B,
          room_number: '02',
          type: '30/60',
          price: 300000,
          status: 'booked'
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'ownerB@mail.com', password: 'Password1!' })


        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get('/api/me/rooms')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)


        response.body.data.forEach((room) => {
          expect(room.status).toBe('booked')
        })
        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })
    })


    // FILTERING

    describe('filtering', () => {
      // Setup shared beforeEach:
      // - owner yang login punya:
      //   - room harga 200.000 status available  → room_01
      //   - room harga 500.000 status available  → room_02
      //   - room harga 300.000 status booked     → room_03
      //   - room harga 400.000 status booked     → room_04

      let accessToken
      let ownerId

      beforeEach(async () => {
        ownerId = randomUUID()
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner Name',
          email: 'owner@mail.com',
          password: hashedPassword,
          role: 'owner',
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '01',
          price: 200000,
          status: 'available',
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '02',
          price: 500000,
          status: 'available',
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '03',
          price: 300000,
          status: 'booked',
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: ownerId,
          room_number: '04',
          price: 400000,
          status: 'booked',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'owner@mail.com', password: 'Password1!' })

        accessToken = loginResponse.body.data.accessToken
      })

      // 6. should return only available rooms when filter status=available
      //    - query: ?status=available
      //    - assert: data.length === 2, semua status 'available'

      it('should return only available rooms when filter status is available', async () => {
        const response = await request(server)
          .get('/api/me/rooms?status=available')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)


        response.body.data.forEach((room) => {
          expect(room.status).toBe('available')
        })
        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 7. should return only booked rooms when filter status=booked
      //    - query: ?status=booked
      //    - assert: data.length === 2, semua status 'booked'
      it('should return only booked rooms when filter status is booked', async () => {
        const response = await request(server)
          .get('/api/me/rooms?status=booked')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)


        response.body.data.forEach((room) => {
          expect(room.status).toBe('booked')
        })
        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 8. should return rooms filtered by minPrice
      //    - query: ?minPrice=400000
      //    - assert: data.length === 2 (500k available + 400k booked)
      //    - assert: semua price >= 400000
      it('should return rooms filtered by minPrice', async () => {
        const response = await request(server)
          .get('/api/me/rooms?minPrice=400000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.price).toBeGreaterThanOrEqual(400000)
        })

        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'available', price: 500000 }),
            expect.objectContaining({ status: 'booked', price: 400000 }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked', price: 300000 }),
            expect.objectContaining({ status: 'available', price: 200000 }),
          ])
        )

        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 9. should return rooms filtered by maxPrice
      //    - query: ?maxPrice=300000
      //    - assert: data.length === 2 (200k available + 300k booked)
      //    - assert: semua price <= 300000
      it('should return rooms filtered by maxPrice', async () => {
        const response = await request(server)
          .get('/api/me/rooms?maxPrice=300000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.price).toBeLessThanOrEqual(300000)
        })

        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked', price: 300000 }),
            expect.objectContaining({ status: 'available', price: 200000 }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'available', price: 500000 }),
            expect.objectContaining({ status: 'booked', price: 400000 }),
          ])
        )

        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 10. should return rooms filtered by minPrice and maxPrice
      //     - query: ?minPrice=300000&maxPrice=450000
      //     - assert: data.length === 2 (300k booked + 400k booked)
      //     - assert: semua price dalam rentang

      it('should return rooms filtered by minPrice and maxPrice', async () => {
        const response = await request(server)
          .get('/api/me/rooms?minPrice=300000&maxPrice=450000')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response.body.data.forEach((room) => {
          expect(room.price).toBeGreaterThanOrEqual(300000)
          expect(room.price).toBeLessThanOrEqual(450000)
        })

        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'booked', price: 300000 }),
            expect.objectContaining({ status: 'booked', price: 400000 }),
          ])
        )

        expect(response.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 'available', price: 500000 }),
            expect.objectContaining({ status: 'available', price: 200000 }),
          ])
        )

        expect(response.body.meta.pagination.page).toBe(1)
        expect(response.body.meta.pagination.limit).toBe(10)
        expect(response.body.meta.pagination.total).toBe(2)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })

      // 11. should not be able to filter by other owner's rooms via ownerId query
      //     - seed: owner_B punya 1 room
      //     - query: ?ownerId=${owner_B}  ← coba inject dari luar
      //     - assert: tetap dapat room milik owner yang login (ownerId dari JWT menang)
      //     - poin: ini security test — ownerId dari JWT tidak bisa di-override

      it('should not be able to filter by other owners rooms via ownerId query', async () => {
        const owner_B = randomUUID()

        await UsersTableTestHelper.addUser({
          id: owner_B,
          role: 'owner',
        })

        await RoomsTableTestHelper.addRoom({
          owner_id: owner_B,
          room_number: '01',
          price: 200000,
          status: 'available',
        })

        const response = await request(server)
          .get(`/api/me/rooms?ownerId=${owner_B}`)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(4)

        response.body.data.forEach((room) => {
          expect(room.owner_id).toBe(ownerId)
          expect(room.owner_id).not.toBe(owner_B)
        })

        expect(response.body.meta.pagination.total).toBe(4)
      })
    })


    // PAGINATION

    // Setup shared beforeEach:
    // - owner yang login punya 5 rooms (mix available + booked)

    // 12. should return rooms limited by `limit` param
    //     - query: ?limit=2
    //     - assert: data.length === 2

    // 13. should return correct rooms on page 2
    //     - query: ?page=2&limit=2
    //     - assert: data.length === 2, tidak overlap dengan page 1

    // 14. should return correct pagination metadata
    //     - query: ?page=1&limit=2
    //     - assert: { page: 1, limit: 2, total: 5, totalPages: 3 }

    // 15. should return empty data when page exceeds total
    //     - query: ?page=99&limit=10
    //     - assert: data.length === 0, total === 5
    describe('pagination', () => {
      let accessToken
      let ownerId

      beforeEach(async () => {
        ownerId = randomUUID()
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner Name',
          email: 'owner@mail.com',
          password: hashedPassword,
          role: 'owner',
        })

        await RoomsTableTestHelper.addRoom({ owner_id: ownerId, room_number: '01', price: 100000, status: 'available' })
        await RoomsTableTestHelper.addRoom({ owner_id: ownerId, room_number: '02', price: 200000, status: 'available' })
        await RoomsTableTestHelper.addRoom({ owner_id: ownerId, room_number: '03', price: 300000, status: 'booked' })
        await RoomsTableTestHelper.addRoom({ owner_id: ownerId, room_number: '04', price: 400000, status: 'booked' })
        await RoomsTableTestHelper.addRoom({ owner_id: ownerId, room_number: '05', price: 500000, status: 'available' })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: 'owner@mail.com', password: 'Password1!' })

        accessToken = loginResponse.body.data.accessToken
      })

      // 12.
      it('should return rooms limited by limit param', async () => {
        const response = await request(server)
          .get('/api/me/rooms?limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
      })

      // 13.
      it('should return correct rooms on page 2', async () => {
        const page1 = await request(server)
          .get('/api/me/rooms?page=1&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        const page2 = await request(server)
          .get('/api/me/rooms?page=2&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(page2.status).toBe(200)
        expect(page2.body.data).toHaveLength(2)

        const page1Ids = page1.body.data.map((room) => room.id)
        const page2Ids = page2.body.data.map((room) => room.id)

        // tidak ada id yang overlap antara page 1 dan page 2
        page2Ids.forEach((id) => {
          expect(page1Ids).not.toContain(id)
        })
      })

      // 14.
      it('should return correct pagination metadata', async () => {
        const response = await request(server)
          .get('/api/me/rooms?page=1&limit=2')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.meta.pagination).toEqual({
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
        })
      })

      // 15.
      it('should return empty data when page exceeds total', async () => {
        const response = await request(server)
          .get('/api/me/rooms?page=99&limit=10')
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(0)
        expect(response.body.meta.pagination.total).toBe(5)
        expect(response.body.meta.pagination.totalPages).toBe(1)
      })
    })

  })

  describe('when GET /api/rooms/:id', () => {
    describe('authentication', () => {
      it('should response 401 when no access token provided', async () => {
        const response = await request(server)
          .get('/api/rooms/1')

        expect(response.status).toBe(401)
      })

      it('should response 401 when access token is invalid', async () => {
        const response = await request(server)
          .get('/api/rooms/1')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)
      })
    })

    describe('success response', () => {
      it('should response 200 and return room detail when room exists', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerId = randomUUID()
        const roomId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner A',
          email: `${ownerId}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        // rooms 
        await RoomsTableTestHelper.addRoom({
          id: roomId,
          owner_id: ownerId,
          room_number: '01',
          type: '30/60',
          price: 300000,
          status: 'available'
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${ownerId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get(`/api/rooms/${roomId}`)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.data.id).toBe(roomId)
        expect(response.body.data.owner_id).toBe(ownerId)
        expect(response.body.data.room_number).toBe('01')
        expect(response.body.data.status).toBe('available')
      })
    })

    describe('failed response', () => {
      it('should response 404 when room id does not exist', async () => {
        const hashedPassword = await bcrypt.hash('Password1!', 10)

        const ownerId = randomUUID()
        const fakeRoomId = randomUUID()

        await UsersTableTestHelper.addUser({
          id: ownerId,
          name: 'Owner A',
          email: `${ownerId}@mail.com`,
          password: hashedPassword,
          role: 'owner',
        })

        const loginResponse = await request(server)
          .post('/api/authentications')
          .send({ email: `${ownerId}@mail.com`, password: 'Password1!' })

        const { accessToken } = loginResponse.body.data

        const response = await request(server)
          .get(`/api/rooms/${fakeRoomId}`)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(404)
      })
    })
  })

  /*
  1. Authentication: 401 no token, 401 invalid token

  2. Authorization: 403 kalau role tenant, 403 kalau bukan owner room tersebut

  3. Validation: 400 kalau body kosong, 400 kalau tipe data salah

  4. Not Found: 404 kalau room tidak ada

  5. Success: 200 dan data terupdate
  */
  describe('when PUT /api/rooms/:id', () => {

    let accessToken
    let ownerId
    let roomId

    beforeEach(async () => {
      ownerId = randomUUID()
      roomId = randomUUID()
      const hashedPassword = await bcrypt.hash('Password1!', 10)

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
        facilities: ['bed', 'bathroom'],
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'owner@mail.com', password: 'Password1!' })

      accessToken = loginResponse.body.data.accessToken
    })

    it('should response 401 when access token is invalid', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', 'Bearer invalid_token')  // token invalid
        .send({ room_number: '02' })

      expect(response.status).toBe(401)
    })

    it('should response 403 when role is tenant', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Tenant Name',
        email: 'tenant@mail.com',
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'tenant@mail.com', password: 'Password1!' })

      const tenantAccessToken = loginResponse.body.data.accessToken

      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${tenantAccessToken}`)
        .send({ room_number: '02' })

      expect(response.status).toBe(403)
    })

    it('should response 403 when owner tries to update another owner room', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)
      const otherOwnerId = randomUUID()

      await UsersTableTestHelper.addUser({
        id: otherOwnerId,
        name: 'Other Owner',
        email: 'otherowner@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'otherowner@mail.com', password: 'Password1!' })

      const otherOwnerAccessToken = loginResponse.body.data.accessToken

      const response = await request(server)
        .put(`/api/rooms/${roomId}`)  // room milik ownerId dari owner asli di beforeEach
        .set('Authorization', `Bearer ${otherOwnerAccessToken}`)
        .send({ room_number: '02' })

      expect(response.status).toBe(403)
    })

    it('should response 400 when payload is empty', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('tidak dapat mengupdate kamar karena tidak ada properti yang dikirim')
    })

    it('should response 400 when data type payload is wrong', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ room_number: 2 })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('tidak dapat mengupdate kamar karena tipe data tidak sesuai')
    })

    it('should response 400 when status payload is wrong', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'ready' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('tidak dapat mengupdate kamar karena status tidak valid')
    })

    it('should response 400 when room_number is too long', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ room_number: '2'.repeat(11) })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('tidak dapat mengupdate kamar karena nomor kamar terlalu panjang')
    })

    it('should response 400 when type room is too long', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ type: '3'.repeat(51) })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('tidak dapat mengupdate kamar karena type terlalu panjang')
    })

    it('should response 404 when no room', async () => {
      const fakeRoomId = randomUUID()

      const response = await request(server)
        .put(`/api/rooms/${fakeRoomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ room_number: '02' })

      expect(response.status).toBe(404)
    })

    it('should response 200 when success update payload', async () => {
      const response = await request(server)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          room_number: '02',
          type: '36/72',
          price: 500000,
          facilities: ['shower', 'couch'],
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.room_number).toBe('02')
      expect(response.body.data.type).toBe('36/72')
      expect(response.body.data.price).toBe(500000)
      expect(response.body.data.facilities).toEqual(['shower', 'couch'])
    })
  })

  describe('when DELETE /api/rooms/:id', () => {
    let accessToken
    let ownerId
    let roomId

    beforeEach(async () => {
      ownerId = randomUUID()
      roomId = randomUUID()
      const hashedPassword = await bcrypt.hash('Password1!', 10)

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

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'owner@mail.com', password: 'Password1!' })

      accessToken = loginResponse.body.data.accessToken
    })

    it('should response 401 when no access token provided', async () => {
      const response = await request(server)
        .delete(`/api/rooms/${roomId}`)

      expect(response.status).toBe(401)
    })

    it('should response 401 when access token is invalid', async () => {
      const response = await request(server)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', 'Bearer invalid_token')

      expect(response.status).toBe(401)
    })

    it('should response 403 when role is tenant', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Tenant Name',
        email: 'tenant@mail.com',
        password: hashedPassword,
        role: 'tenant',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'tenant@mail.com', password: 'Password1!' })

      const tenantAccessToken = loginResponse.body.data.accessToken

      const response = await request(server)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${tenantAccessToken}`)

      expect(response.status).toBe(403)
    })

    it('should response 403 when owner tries to delete another owner room', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Other Owner',
        email: 'otherowner@mail.com',
        password: hashedPassword,
        role: 'owner',
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'otherowner@mail.com', password: 'Password1!' })

      const otherOwnerAccessToken = loginResponse.body.data.accessToken

      const response = await request(server)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${otherOwnerAccessToken}`)

      expect(response.status).toBe(403)
    })

    it('should response 404 when room not found', async () => {
      const fakeRoomId = randomUUID()

      const response = await request(server)
        .delete(`/api/rooms/${fakeRoomId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
    })

    it('should response 200 and delete room successfully', async () => {
      const response = await request(server)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')

      // verifikasi room benar-benar terhapus dari DB
      const deletedRoom = await RoomsTableTestHelper.findRoomById(roomId)
      expect(deletedRoom).toBeUndefined()
    })
  })
})
