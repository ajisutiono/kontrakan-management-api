import AuthenticationRepository from '../../Domains/authentications/AuthenticationRepository.js'
import InvariantError from '../../Commons/exceptions/InvariantError.js'

class AuthenticationRepositoryPostgres extends AuthenticationRepository {
  constructor({ pool }) {
    super()
    this._pool = pool
  }

  async addToken(token) {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    }

    await this._pool.query(query)
  }

  async checkAvailableToken(token) {
    const query = {
      text: 'SELECT * FROM authentications WHERE token = $1',
      values: [token]
    }

    const result = await this._pool.query(query)

    if(result.rows.length === 0) {
      throw new InvariantError('refresh token tidak ditemukan')
    }
  }

  async deleteToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token]
    }

    await this._pool.query(query)
  }
}

export default AuthenticationRepositoryPostgres