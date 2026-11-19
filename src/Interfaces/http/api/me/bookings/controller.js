import asyncHandler from '../../../../../Commons/utils/asyncHandler.js'

class MyBookingsController {
  constructor(container) {
    this._container = container
  }

  getMyBookings = asyncHandler(async (req, res) => {
    const { page, limit, status, roomId } = req.query

    const finalPage = Number.isNaN(Number(page)) ? 1 : Number(page)
    const finalLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit)

    const filters = {}
    if (status) filters.status = status
    if (roomId) filters.roomId = roomId

    const getMyBookingsUseCase = this._container.resolve('getMyBookingsUseCase')

    const result = await getMyBookingsUseCase.execute({
      userId: req.user.id,
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
        },
      },
    })
  })
}

export default MyBookingsController