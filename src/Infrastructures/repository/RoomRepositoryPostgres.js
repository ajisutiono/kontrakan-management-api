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

    if (!result.rows[0]) {
      throw new NotFoundError('id room not found')
    }

    return result.rows[0]
  }

  async updateRoomById(roomId, updateRoom) {
    const { room_number, type, price, facilities, status } = updateRoom

    const setClauses = []
    const values = []

    if (room_number !== undefined) {
      values.push(room_number)
      setClauses.push(`room_number = $${values.length}`)
    }

    if (type !== undefined) {
      values.push(type)
      setClauses.push(`type = $${values.length}`)
    }

    if (price !== undefined) {
      values.push(price)
      setClauses.push(`price = $${values.length}`)
    }

    if (facilities !== undefined) {
      values.push(JSON.stringify(facilities))
      setClauses.push(`facilities = $${values.length}`)
    }

    if (status !== undefined) {
      values.push(status)
      setClauses.push(`status = $${values.length}`)
    }

    setClauses.push('updated_at = NOW()')

    values.push(roomId)

    const query = {
      text: `UPDATE rooms
                   SET ${setClauses.join(', ')}
                   WHERE id = $${values.length}
                   RETURNING id, owner_id, room_number, type, price, facilities, status, updated_at`,
      values,
    }
    const result = await this._pool.query(query)
    const row = result.rows[0]

    return {
      ...row,
      price: Number(row.price),
      facilities: row.facilities ?? null,
    }
  }

  async deleteRoomById(roomId) {
    const query = {
      text: 'DELETE FROM rooms WHERE id = $1',
      values: [roomId],
    }

    await this._pool.query(query)
  }
}

export default RoomRepositoryPostgres