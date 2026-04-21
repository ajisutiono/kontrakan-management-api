import asyncHandler from '../../../../Commons/utils/asyncHandler.js'

class RoomsController {
  constructor(container) {
    this._container = container
  }

  postRoom = asyncHandler(async (req, res) => {
    const addRoomUseCase = this._container.resolve('addRoomUseCase')
    const registeredRoom = await addRoomUseCase.execute({
      ...req.body,
      role: req.user.role,
      owner_id: req.user.id,
    })
    res.status(201).json({
      status: 'success',
      data: registeredRoom
    })
  })

  getRooms = asyncHandler(async (req, res) => {
    const { page, limit, ownerId, minPrice, maxPrice } = req.query

    const finalPage = Number.isNaN(Number(page)) ? 1 : Number(page)
    const finalLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit)

    const filters = {}
    if (ownerId) filters.ownerId = ownerId
    if (minPrice !== undefined) filters.minPrice = Number(minPrice)
    if (maxPrice !== undefined) filters.maxPrice = Number(maxPrice)

    const getRoomsUseCase = this._container.resolve('getRoomsUseCase')

    const result = await getRoomsUseCase.execute({
      filters,
      page: finalPage,
      limit: finalLimit,
    })

    res.json({
      status: 'success',
      data: result.data,
      meta: {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      }
    })
  })
}

export default RoomsController