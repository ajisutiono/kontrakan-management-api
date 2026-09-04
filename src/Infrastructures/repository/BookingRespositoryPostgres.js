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
}

export default BookingRepositoryPostgres