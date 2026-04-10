import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'

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
})