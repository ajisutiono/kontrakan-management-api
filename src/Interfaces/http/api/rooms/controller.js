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
}

export default RoomsController