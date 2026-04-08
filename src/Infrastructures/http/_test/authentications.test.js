import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('Authentications API', () => {
  const server = createServer(container)

  afterAll(async() => {
    await pool.end()
  })

  afterEach(async() => {
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /api/authentications', () => {
    it('should response 201 when create new authentication sucessfully', async() => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner'
      })

      const response = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    it('should response 400 when payload not contain needed property', async() => {
      const response = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com' })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('harus memasukkan email dan password')
    })

    it('should response 400 when payload not meet data type specification', async() => {
      const response = await request(server)
        .post('/api/authentications')
        .send({ email: true, password: 'Password1!' })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('email dan password harus string')
    })

    it('should response 401 when email not exists or password wrong', async() => {
      const response = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('email atau password salah')
    })
  })

  describe('when PUT /api/authentications', () => {
    it('should response 200 when create new access token successfully', async() => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner'
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { refreshToken } = loginResponse.body.data

      const response = await request(server)
        .put('/api/authentications')
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.accessToken).toBeDefined()
    })

    it('should response 400 when not contain needed property', async() => {
      const response = await request(server)
        .put('/api/authentications')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('property yang dibutuhkan tidak ada')
    })

    it('should response 400 when not meet data type specification', async() => {
      const response = await request(server)
        .put('/api/authentications')
        .send({ refreshToken: 123 })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('harus memasukkan tipe data yang sesuai')
    })

    it('should response 400 when refresh token not valid', async () => {
      const response = await request(server)
        .put('/api/authentications')
        .send({ refreshToken: 'invalid_refreshToken' })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('refresh token tidak valid')
    })

    it('should response 400 when refresh token not exists', async() => {
      const refreshToken = await container.resolve('tokenManager').createRefreshToken({ email: 'testing@mail.com' })

      const response = await request(server)
        .put('/api/authentications')
        .send({ refreshToken })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('refresh token tidak ditemukan')
    })
  })

  describe('when DELETE /api/authentications', () => {
    it('should response 200 when delete refresh token successfully', async() => {
      const hashedPassword = await bcrypt.hash('Password1!', 10)

      await UsersTableTestHelper.addUser({
        name: 'Testing Name',
        email: 'testing@mail.com',
        password: hashedPassword,
        role: 'owner'
      })

      const loginResponse = await request(server)
        .post('/api/authentications')
        .send({ email: 'testing@mail.com', password: 'Password1!' })

      const { refreshToken } = loginResponse.body.data

      const response = await request(server)
        .delete('/api/authentications')
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    })

    it('should response 400 when not contain needed property', async() => {
      const response = await request(server)
        .delete('/api/authentications')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('property yang dibutuhkan tidak ada')
    })

    it('should response 400 when not meet data type specification', async() => {
      const response = await request(server)
        .delete('/api/authentications')
        .send({ refreshToken: 123 })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('harus memasukkan tipe data yang sesuai')
    })

    it('should response 400 when refresh token not exists', async() => {
      const refreshToken = await container.resolve('tokenManager').createRefreshToken({ email: 'testing@mail.com' })

      const response = await request(server)
        .delete('/api/authentications')
        .send({ refreshToken })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.message).toBe('refresh token tidak ditemukan')
    })
  })
})