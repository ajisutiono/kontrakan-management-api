import asyncHandler from '../../../../Commons/utils/asyncHandler.js'

class AuthenticationsController {
  constructor(container) {
    this._container = container
  }

  postAuthentication = asyncHandler(async (req, res) => {
    const loginUserUseCase = this._container.resolve('loginUserUseCase')
    const { accessToken, refreshToken } = await loginUserUseCase.execute(req.body)

    res.json({
      status: 'success',
      data: { 
        accessToken,
        refreshToken,
      },
    })
  })
}

export default AuthenticationsController