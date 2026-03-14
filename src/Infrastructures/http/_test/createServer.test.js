import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('HTTP server', () => {
  const server = createServer(container)

  afterAll(async() => {
    await pool.end()
  })

  afterEach(async() => {
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /api/users', () => {
    // if there is a route that is not registered throw 404
    it('should response 404 when route not found', async () => {
      const response = await request(server)
        .get('/api/endpoint-tidak-ada')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('resource tidak ditemukan')
    })


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
    

    /*
  Scenarios test 400:
  1. REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY ✅
     message: tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada
  2. REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION ✅
     message: tidak dapat membuat user baru karena tipe data tidak sesuai
  3. REGISTER_USER.NAME_TOO_LONG ✅
     message: tidak dapat membuat user baru karena nama terlalu panjang
  4.REGISTER_USER.EMAIL_TOO_LONG ✅
     message: tidak dapat membuat user baru karena email terlalu panjang
  5.REGISTER_USER.PASSWORD_BELOW_MINIMUM_LENGTH ✅
     message: tidak dapat membuat user baru karena password terlalu pendek

  6. REGISTER_USER.INVALID_EMAIL  ✅
     message: tidak dapat membuat user baru karena format email tidak valid
  7. REGISTER_USER.INVALID_ROLE ✅
     message:tidak dapat membuat user baru karena role tidak valid
  8. REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER ✅
     message: tidak dapat membuat user baru karena nama mengandung karakter terlarang
  9. Email already exists in database ✅

  */  
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
      expect(response.body.message).toBe('tidak dapat membuat user baru karena email sudah ada')
    })

    it('should response 400 when payload name contain restricted character', async() => {
      const requestPayload = {
        name: 'Test@User', // symbol restricted
        email: 'testing@example.com',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena nama mengandung karakter terlarang')
    })

    it('should response 400 when payload email invalid', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'invalid-email', // payload invalid
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena format email tidak valid')
    })

    it('should response 400 when payload not contain needed property', async() => {

      const requestPayload = {
        // missing name
        email: 'testing@mail.com',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when payload not meet data type specification', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'testing@mail.com',
        password: 'Password1!',
        role: true,
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena tipe data tidak sesuai')
    })

    it('should response 400 when payload name too long', async() => {

      const requestPayload = {
        name: 'a'.repeat(101),
        email: 'testing@mail.com',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena nama terlalu panjang')
    })

    it('should response 400 when payload email too long', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'a'.repeat(101) + '@mail.com',
        password: 'Password1!',
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena email terlalu panjang')
    })

    it('should response 400 when payload password too short', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'testing@mail.com',
        password: 'Pass1!', // password < 8
        role: 'owner',
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena password terlalu pendek')
    })

    it('should response 400 when payload role not contain correctly', async() => {

      const requestPayload = {
        name: 'Test User',
        email: 'testing@mail.com',
        password: 'Password1!',
        role: 'admin', // [onwer or tentant]
      }

      const response = await request(server)
        .post('/api/users')
        .send(requestPayload)
      
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('tidak dapat membuat user baru karena role tidak valid')
    })

    /*
    scenarios 500 error
    */
    it('should response 500 when unhandled error occurs', async () => {
      const requestPayload = {
        name: 'Test User',
        email: 'testing@mail.com',
        password: 'Password1!',
        role: 'owner',
      }

      const errorServer = createServer({
        resolve: () => {
          throw new Error('Unexpected error')
        },
      })

      const response = await request(errorServer)
        .post('/api/users')
        .send(requestPayload)

      expect(response.status).toBe(500)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('Internal server error')
    })
  })
})