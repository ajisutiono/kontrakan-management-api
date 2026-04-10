/* istanbul ignore file */
import { randomUUID } from 'crypto'

import pool from '../src/Infrastructures/database/postgres/pool.js'

const RoomsTableTestHelper = {
  async addRoom({
    id = randomUUID(),
    owner_id,
    room_number = '001',
    type = '30/60',
    price = 150000000,
    facilities,
  } = {}) {
    const query = {
      text: `INSERT INTO rooms (id, owner_id, room_number, type, price, facilities)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, owner_id, room_number, type, price, facilities ? JSON.stringify(facilities) : null]
    }

    await pool.query(query)
  },

  async findRoomById(id) {
    const query = {
      text: 'SELECT * FROM rooms WHERE id = $1',
      values: [id],
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async findRoomsByOwnerId(ownerId) {
    const query = {
      text: 'SELECT * FROM rooms WHERE owner_id = $1',
      values: [ownerId]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE rooms CASCADE')
  },
}

export default RoomsTableTestHelper