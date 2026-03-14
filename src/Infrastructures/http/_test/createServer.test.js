import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import createServer from '../createServer.js'

describe('HTTP server', () => {
  const server = createServer()

  afterAll(async() => {
    await pool.end()
  })

  afterEach(async() => {
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /api/users', () => {
    it('should response 201 and persisted user', async() => {
      // Arrange
      const requestPayload = {
        name: 'Test User',
        email: 'testing@mail.com',
        password: 'Password1!',
        role: 'owner',
      }

      // Action
      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.registeredUser).toBeDefined()
      expect(response.body.data.registeredUser.id).toBeDefined()
      expect(response.body.data.registeredUser.name).toBe('Test User')
      expect(response.body.data.registeredUser.role).toBe('owner')
    })

    it('should response 400 when email already exists', async() => {
      await UsersTableTestHelper.addUser({ email: 'testing@example.com'})

      const requestPayload = {
        name: 'Test User',
        email: 'testing@example.com',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
    })

    it('should response 400 when payload invalid', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
    })
  })
})