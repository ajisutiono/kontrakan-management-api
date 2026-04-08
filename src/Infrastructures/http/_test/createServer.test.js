import { afterAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import pool from '../../database/postgres/pool.js'
import createServer from '../createServer.js'
import container from '../../container.js'

describe('HTTP server', () => {
  const server = createServer(container)

  afterAll(async() => {
    await pool.end()
  })

  it('should response 404 when route not found', async () => {
    const response = await request(server)
      .get('/api/endpoint-tidak-ada')

    expect(response.status).toBe(404)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toBe('resource tidak ditemukan')
  })

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