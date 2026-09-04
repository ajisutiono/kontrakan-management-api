/* istanbul ignore file */
import { randomUUID } from 'crypto'
import pool from '../src/Infrastructures/database/postgres/pool.js'

const BookingsTableTestHelper = {
  async addBooking({
    id = randomUUID(),
    room_id,
    tenant_id,
    start_date = '2026-10-01',
    status = 'active',
  } = {}) {
    const query = {
      text: `INSERT INTO bookings (id, room_id, tenant_id, start_date, status)
             VALUES ($1, $2, $3, $4, $5)`,
      values: [id, room_id, tenant_id, start_date, status],
    }

    await pool.query(query)
  },

  async findBookingById(id) {
    const query = {
      text: 'SELECT * FROM bookings WHERE id = $1',
      values: [id],
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async findBookingsByTenantId(tenantId) {
    const query = {
      text: 'SELECT * FROM bookings WHERE tenant_id = $1',
      values: [tenantId],
    }

    const result = await pool.query(query)
    return result.rows
  },

  async findBookingsByRoomId(roomId) {
    const query = {
      text: 'SELECT * FROM bookings WHERE room_id = $1',
      values: [roomId],
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE bookings CASCADE')
  },
}

export default BookingsTableTestHelper