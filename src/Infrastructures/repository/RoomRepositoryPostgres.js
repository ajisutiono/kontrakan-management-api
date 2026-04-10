import { randomUUID } from 'crypto'

import RoomRepository from '../../Domains/rooms/RoomRepository.js'

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
}

export default RoomRepositoryPostgres