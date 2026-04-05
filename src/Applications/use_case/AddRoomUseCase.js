import RegisterRoom from '../../Domains/rooms/entities/RegisterRoom.js'
import RegisteredRoom from '../../Domains/rooms/entities/RegisteredRoom.js'

class AddRoomUseCase {
  constructor({
    roomRepository
  }) {
    this._roomRepository = roomRepository
  }

  async execute(useCasePayload) {

    const registerRoom = new RegisterRoom(useCasePayload)
    const registeredRoom = await this._roomRepository.addRoom(registerRoom)

    return new RegisteredRoom(registeredRoom)

  }
}

export default AddRoomUseCase