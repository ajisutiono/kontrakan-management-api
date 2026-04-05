class RegisterRoom {
  constructor(payload) {
    this._validatePayload(payload)

    const { owner_id, room_number, type, price, facilities } = payload
    this.owner_id = owner_id
    this.room_number = room_number
    this.type = type
    this.price = price
    this.facilities = facilities
  }

  _validatePayload({ owner_id, room_number, type, price, facilities }) {
    if(!room_number || !type || !price) {
      throw new Error('REGISTER_ROOM.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof owner_id !== 'string'
        || typeof room_number !== 'string'
        || typeof type !== 'string'
        || typeof price !== 'number'
        || (facilities !== undefined && typeof facilities !== 'object')
    ) {
      throw new Error('REGISTER_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if(room_number.length > 10) {
      throw new Error('REGISTER_ROOM.ROOM_NUMBER_TOO_LONG')
    }

    if(type.length > 50) {
      throw new Error('REGISTER_ROOM.TYPE_TOO_LONG')
    }
  }
}

export default RegisterRoom