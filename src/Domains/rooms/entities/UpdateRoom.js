class UpdateRoom {
  constructor(payload) {
    this._validatePayload(payload)

    const { room_number, type, price, facilities, status } = payload
    this.room_number = room_number
    this.type = type
    this.price = price
    this.facilities = facilities
    this.status = status
  }

  _validatePayload({ room_number, type, price, facilities, status }) {

    if (!room_number && !type && !price && !facilities && !status) {
      throw new Error('UPDATE_ROOM.NEED_AT_LEAST_ONE_PROPERTY')
    }

    if (room_number !== undefined && typeof room_number !== 'string') {
      throw new Error('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if (type !== undefined && typeof type !== 'string') {
      throw new Error('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if (price !== undefined && typeof price !== 'number') {
      throw new Error('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
    if (facilities !== undefined && !Array.isArray(facilities)) {
      throw new Error('UPDATE_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if (status !== undefined && !['available', 'booked'].includes(status)) {
      throw new Error('UPDATE_ROOM.INVALID_STATUS')
    }

    if (room_number !== undefined && room_number.length > 10) {
      throw new Error('UPDATE_ROOM.ROOM_NUMBER_TOO_LONG')
    }

    if (type !== undefined && type.length > 50) {
      throw new Error('UPDATE_ROOM.TYPE_TOO_LONG')
    }
  }
}

export default UpdateRoom