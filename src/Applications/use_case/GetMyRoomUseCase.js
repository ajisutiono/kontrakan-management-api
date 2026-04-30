import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js'

class GetMyRoomUseCase {
  constructor({ roomRepository }) {
    this._roomRepository = roomRepository
  }

  async execute({ filters = {}, page = 1, limit = 10, ownerId, userRole }) {
    if(userRole !== 'owner') {
      throw new AuthorizationError('akses forbidden')
    }

    const filtersFinal = { ...filters, ownerId }

    return await this._roomRepository.getRooms({
      filters: filtersFinal,
      page,
      limit
    })
  }
}

export default GetMyRoomUseCase