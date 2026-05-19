import { randomUUID } from 'crypto'

import RoomRepository from '../../Domains/rooms/RoomRepository.js'
import NotFoundError from '../../Commons/exceptions/NotFoundError.js'

class RoomRepositoryPostgres extends RoomRepository {
  /* istanbul ignore next */
  constructor({ pool, idGenerator = randomUUID }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator

  }

  async addRoom(room) {
    const { owner_id, room_number, type, price, facilities } = room
    const id = this._idGenerator()

    const query = {
      text: 'INSERT INTO rooms (id, owner_id, room_number, type, price, facilities) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, owner_id, room_number',
      values: [id, owner_id, room_number, type, price, facilities ? JSON.stringify(facilities) : null]
    }

    const result = await this._pool.query(query)
    return result.rows[0]
  }

  async getRooms({ filters = {}, page = 1, limit = 10 }) {
    const { ownerId, minPrice, maxPrice, status } = filters

    const conditions = []
    const values = []

    if (ownerId) {
      values.push(ownerId)
      conditions.push(`r.owner_id = $${values.length}`)
    }

    if (minPrice !== undefined) {
      values.push(minPrice)
      conditions.push(`r.price >= $${values.length}`)
    }

    if (maxPrice !== undefined) {
      values.push(maxPrice)
      conditions.push(`r.price <= $${values.length}`)
    }

    // 🔥 pindahkan ke sini (dari use case)
    if (status) {
      values.push(status)
      conditions.push(`r.status = $${values.length}`)
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const offset = (page - 1) * limit

    const result = await this._pool.query({
      text: `SELECT
              r.id,
              r.room_number,
              r.type,
              r.price,
              r.facilities,
              r.status,
              u.id AS owner_id,
              u.name AS owner_name,
              u.email AS owner_email
           FROM rooms r
           JOIN users u ON r.owner_id = u.id
           ${whereClause}
           ORDER BY r.created_at DESC
           LIMIT $${values.length + 1}
           OFFSET $${values.length + 2}`,
      values: [...values, limit, offset],
    })

    const countResult = await this._pool.query({
      text: `SELECT COUNT(*) FROM rooms r ${whereClause}`,
      values,
    })

    const total = Number(countResult.rows[0].count)

    return {
      data: result.rows.map((row) => ({
        ...row,
        price: Number(row.price),
      })),
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    }
  }

  async getRoomById(roomId) {
    const query = {
      text: 'SELECT * FROM rooms WHERE id = $1',
      values: [roomId]
    }

    const result = await this._pool.query(query)

    if(!result.rows[0]) {
      throw new NotFoundError('id room not found')
    }

    return result.rows[0]
  }
}

export default RoomRepositoryPostgres