/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js'

const AuthenticationsTableTestHelper = {
  async addToken(token = 'refresh_token_sample') {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    }

    await pool.query(query)
    return token
  },

  async findToken(token) {
    const query = {
      text: 'SELECT * FROM authentications WHERE token = $1',
      values: [token],
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE authentications')
  },
}

export default AuthenticationsTableTestHelper