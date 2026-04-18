class GetRoomsUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({ filters = {}, page = 1, limit = 10 }) {
    const finalFilters = { ...filters }

    finalFilters.status = 'available'

    return await this._roomRepository.getRooms({
      filters: finalFilters,
      page,
      limit,
    })
  }
}

export default GetRoomsUseCase