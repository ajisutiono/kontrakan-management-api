import asyncHandler from '../../../../Commons/utils/asyncHandler.js'

class AuthenticationsController {
  constructor(container) {
    this._container = container
  }

  postAuthentication = asyncHandler(async (req, res) => {
    const loginUserUseCase = this._container.resolve('loginUserUseCase')
    const { accessToken, refreshToken } = await loginUserUseCase.execute(req.body)

    res.status(201).json({
      status: 'success',
      data: { 
        accessToken,
        refreshToken,
      },
    })
  })

  putAuthentication = asyncHandler(async (req, res) => {
    const refreshAuthenticationUseCase = this._container.resolve('refreshAuthenticationUseCase')

    const accessToken = await refreshAuthenticationUseCase.execute(req.body)

    res.status(200).json({
      status: 'success',
      data: {
        accessToken
      }
    })
  })

  deleteAuthentication = asyncHandler(async (req, res) => {
    const deleteAuthenticationUseCase = this._container.resolve('deleteAuthenticationUseCase')

    await deleteAuthenticationUseCase.execute(req.body)

    res.status(200).json({
      status: 'success',
    })
  })
}

export default AuthenticationsController