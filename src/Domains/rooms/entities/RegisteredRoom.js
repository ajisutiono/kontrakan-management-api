class RegisteredRoom {
  constructor(payload) {
    this._validatePayload(payload)

    const {id, owner_id, room_number} = payload
    this.id = id
    this.owner_id = owner_id
    this.room_number = room_number
  }

  _validatePayload({ id, owner_id, room_number }) {
    if(!id || !owner_id || !room_number) {
      throw new Error('REGISTERED_ROOM.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof id !== 'string'
        || typeof owner_id !== 'string'
        || typeof room_number !== 'string'
    ) {
      throw new Error('REGISTERED_ROOM.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

export default RegisteredRoom