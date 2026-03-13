/* istanbul ignore file */
import { randomUUID } from 'crypto'

import pool from '../src/Infrastructures/database/postgres/pool.js'

const UsersTableTestHelper = {
  async addUser({
    id = randomUUID(),
    name = 'Test User',
    email = 'test@example.com',
    password = 'hashed_password',
    role = 'tenant',
  } = {}) {
    const query = {
      text: `INSERT INTO users (id, name, email, password, role)
                    VALUES ($1, $2, $3, $4, $5)`,
      values: [id, name, email, password, role],
    }

    await pool.query(query)
  },

  async findUserById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async findUserByEmail(email) {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE users CASCADE')
  },
}

export default UsersTableTestHelper