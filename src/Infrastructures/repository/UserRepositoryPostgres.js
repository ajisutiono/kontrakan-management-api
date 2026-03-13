import { randomUUID } from 'crypto'

import UserRepository from '../../Domains/users/UserRepository.js'
import InvariantError from '../../Commons/exceptions/InvariantError.js'
import NotFoundError from '../../Commons/exceptions/NotFoundError.js'

class UserRepositoryPostgres extends UserRepository {
  constructor({ pool, idGenerator = randomUUID }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addUser(registerUser) {
    const { name, email, password, role } = registerUser
    const id = this._idGenerator()

    const query = {
      text: 'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role',
      values: [id, name, email, password, role],
    }

    const result = await this._pool.query(query)
    return result.rows[0]
  }

  async verifyAvailableEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError('USER_REPOSITORY.EMAIL_ALREADY_EXISTS')
    }
  }

  async findUserById(userId) {
    const query = {
      text: 'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      values: [userId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('USER_REPOSITORY.USER_NOT_FOUND')
    }

    return result.rows[0]
  }

  async findUserByEmail(email) {
    const query = {
      text: 'SELECT id, name, email, password, role FROM users WHERE email = $1',
      values: [email],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('USER_REPOSITORY.EMAIL_NOT_FOUND')
    }

    return result.rows[0]
  }
}

export default UserRepositoryPostgres