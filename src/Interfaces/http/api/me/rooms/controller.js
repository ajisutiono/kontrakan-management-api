import asyncHandler from '../../../../../Commons/utils/asyncHandler.js'

class MyRoomsController {
  constructor(container) {
    this._container = container
  }

  getMyRooms = asyncHandler(async (req, res) => {
    const { page, limit, status, minPrice, maxPrice } = req.query

    const finalPage = Number.isNaN(Number(page)) ? 1 : Number(page)
    const finalLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit)

    const filters = {}
    if (status) filters.status = status

    if (minPrice !== undefined && minPrice !== '') {
      filters.minPrice = Number(minPrice)
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filters.maxPrice = Number(maxPrice)
    }
   

    const getMyRoomUseCase = this._container.resolve('getMyRoomUseCase')

    const result = await getMyRoomUseCase.execute({
      ownerId: req.user.id,
      userRole: req.user.role,
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

export default MyRoomsController