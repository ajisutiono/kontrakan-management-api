import RegisterRoom from '../../Domains/rooms/entities/RegisterRoom.js'
import RegisteredRoom from '../../Domains/rooms/entities/RegisteredRoom.js'
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js'

class AddRoomUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({ role, ...roomData }) {
    if (role !== 'owner') {
      throw new AuthorizationError('hanya owner yang dapat menambahkan kamar')
    }

    const registerRoom = new RegisterRoom(roomData)
    const registeredRoom = await this._roomRepository.addRoom(registerRoom)

    return new RegisteredRoom(registeredRoom)
  }
}

export default AddRoomUseCase