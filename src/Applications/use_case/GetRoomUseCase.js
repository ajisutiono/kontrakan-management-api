class GetRoomUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute(roomId) {
    return await this._roomRepository.getRoomById(roomId)
  }
}

export default GetRoomUseCase