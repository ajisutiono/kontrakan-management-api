import asyncHandler from '../../../../Commons/utils/asyncHandler.js'

class UsersController {
  constructor(container) {
    this._container = container
  }

  postUser = asyncHandler(async (req, res) => {
    const addUserUseCase = this._container.resolve('addUserUseCase')
    const registeredUser = await addUserUseCase.execute(req.body)

    res.status(201).json({
      status: 'success',
      data: { registeredUser },
    })
  })
}

export default UsersController