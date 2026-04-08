import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import pool from '../../database/postgres/pool.js'
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('when POST /api/users', () => {
  const server = createServer(container)

  afterAll(async() => {
    await pool.end()
  })

  afterEach(async() => {
    await UsersTableTestHelper.cleanTable()
  })

  it('should response 201 and persisted user', async() => {
    const requestPayload = {
      name: 'Test User',
      email: 'testing@mail.com',
      password: 'Password1!',
      role: 'owner',
    }

    const response = await request(server)
      .post('/api/users')
      .send(requestPayload)

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
    expect(response.body.message).toBe('tidak dapat membuat user baru karena email sudah ada')
  })

  it('should response 400 when payload name contain restricted character', async() => {
    const requestPayload = {
      name: 'Test@User',
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
      email: 'invalid-email',
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
      password: 'Pass1!',
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
      role: 'admin',
    }

    const response = await request(server)
      .post('/api/users')
      .send(requestPayload)

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toBe('tidak dapat membuat user baru karena role tidak valid')
  })
})