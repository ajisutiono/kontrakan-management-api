class RegisterBooking {
  constructor(payload) {
    this._validatePayload(payload)

    const { room_id, tenant_id, start_date } = payload
    this.room_id = room_id
    this.tenant_id = tenant_id
    this.start_date = start_date
  }

  _validatePayload({ room_id, tenant_id, start_date }) {
    if (!room_id || !tenant_id || !start_date) {
      throw new Error('REGISTER_BOOKING.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof room_id !== 'string' || typeof tenant_id !== 'string') {
      throw new Error('REGISTER_BOOKING.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if (typeof start_date !== 'string' || isNaN(Date.parse(start_date))) {
      throw new Error('REGISTER_BOOKING.INVALID_START_DATE')
    }
  }
}

export default RegisterBooking