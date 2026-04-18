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
    const { page, limit, ...filters } = req.query

    const getRoomsUseCase = this._container.resolve('getRoomsUseCase')

    const result = await getRoomsUseCase.execute({
      filters,
      page: Number(page),
      limit: Number(limit),
      userRole: req.user.role,
    })

    res.json({
      status: 'success',
      data: result,
    })
  })
}

export default RoomsController