import { afterAll, afterEach, describe, expect, it } from 'vitest'
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
      it('should response 401 when no access token provided', async() => {

        const response = await request(server)
          .get('/api/rooms')

        expect(response.status).toBe(401)
      })

      // 2.
      it('should response 401 when access token is invalid', async() => {
        const response = await request(server)
          .get('/api/rooms')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)        
      })
    })

    describe('success response', () => {
      // 3.
      it('should response 200 and return only available rooms for tenant', async() => {
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
      it('should response 200 and return only available rooms for owner', async() => {
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
      it('should response 200 and return available rooms from multiple owners', async() => {
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
      it('should response 200 and return available rooms filtered by ownerId', async() => {
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
      it('should response 200 and return available rooms filtered by minPrice', async() => {
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
      it('should response 200 and return available rooms filtered by maxPrice', async() => {
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
      it('should response 200 and return available rooms filtered by minPrice and maxPrice', async() => {
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
      it('should response 200 and return limited number of rooms based on limit', async() => {

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
      it('should response 200 and return correct rooms based on page and limit', async() => {

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
      it('should response 200 and return correct pagination metadata (page, limit, total, totalPages)', async() => {

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
    it('should response 200 and return empty data when no rooms found', async() => {
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
    it('should ignore booked rooms even if they match filters', async() => {

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
})
