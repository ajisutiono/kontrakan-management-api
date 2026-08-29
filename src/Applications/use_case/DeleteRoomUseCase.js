import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js'

class DeleteRoomUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({ roomId, ownerId, role }) {
    if (role !== 'owner') {
      throw new AuthorizationError('hanya owner yang dapat menghapus kamar')
    }

    const existingRoom = await this._roomRepository.getRoomById(roomId)
    
    if(existingRoom.owner_id !== ownerId) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk menghapus kamar ini')
    }

    await this._roomRepository.deleteRoomById(roomId)

  }
}

export default DeleteRoomUseCase