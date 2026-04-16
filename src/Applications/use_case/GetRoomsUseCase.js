class GetRoomsUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({filters = {}, page = 1, limit = 10, userRole}) {
    return await this._roomRepository.getRooms({
      filters,
      page,
      limit,
      userRole,
    })
  }
}

export default GetRoomsUseCase