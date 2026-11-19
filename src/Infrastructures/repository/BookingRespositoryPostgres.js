import { randomUUID } from 'crypto'
import BookingRepository from '../../Domains/bookings/BookingRepository.js'

class BookingRepositoryPostgres extends BookingRepository {
  /* istanbul ignore next */
  constructor({ pool, idGenerator = randomUUID }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addBooking(booking) {
    const { room_id, tenant_id, start_date } = booking
    const id = this._idGenerator()

    const query = {
      text: `INSERT INTO bookings (id, room_id, tenant_id, start_date) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, room_id, tenant_id, start_date, status`,
      values: [id, room_id, tenant_id, start_date],
    }

    const result = await this._pool.query(query)
    const row =  result.rows[0]

    return {
      ...row,
      start_date: row.start_date.toLocaleDateString('en-CA'),
    }
  }


  async getBookings({ filters = {}, page = 1, limit = 10 }) {
    const { tenantId, ownerId, status, roomId } = filters

    const conditions = []
    const values = []

    if (tenantId) {
      values.push(tenantId)
      conditions.push(`b.tenant_id = $${values.length}`)
    }

    if (ownerId) {
      values.push(ownerId)
      conditions.push(`r.owner_id = $${values.length}`)
    }

    if (status) {
      values.push(status)
      conditions.push(`b.status = $${values.length}`)
    }

    if (roomId) {
      values.push(roomId)
      conditions.push(`b.room_id = $${values.length}`)
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const offset = (page - 1) * limit

    const result = await this._pool.query({
      text: `SELECT
              b.id,
              b.start_date,
              b.status,
              b.tenant_id,
              u.name AS tenant_name,
              r.id AS room_id,
              r.room_number,
              r.type,
              r.price
           FROM bookings b
           JOIN rooms r ON b.room_id = r.id
           JOIN users u ON b.tenant_id = u.id
           ${whereClause}
           ORDER BY b.created_at DESC
           LIMIT $${values.length + 1}
           OFFSET $${values.length + 2}`,
      values: [...values, limit, offset],
    })

    const countResult = await this._pool.query({
      text: `SELECT COUNT(*)
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             ${whereClause}`,
      values,
    })

    const total = Number(countResult.rows[0].count)

    return {
      data: result.rows.map((row) => ({
        ...row,
        price: Number(row.price),
        start_date: row.start_date.toLocaleDateString('en-CA'),
      })),
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    }
  }

}

export default BookingRepositoryPostgres