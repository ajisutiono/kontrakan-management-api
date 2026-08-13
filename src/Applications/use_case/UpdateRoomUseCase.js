import UpdateRoom from '../../Domains/rooms/entities/UpdateRoom.js'
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js'

class UpdateRoomUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({ roomId, ownerId, role, payload }) {
    if(role !== 'owner') {
      throw new AuthorizationError('hanya owner yang dapat mengedit ruangan')
    }

    const updateRoom = new UpdateRoom(payload)

    const existingRoom = await this._roomRepository.getRoomById(roomId)

    if(existingRoom.owner_id !== ownerId) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk mengedit kamar ini')
    }

    return await this._roomRepository.updateRoomById(roomId, updateRoom)
  }
}

export default UpdateRoomUseCase