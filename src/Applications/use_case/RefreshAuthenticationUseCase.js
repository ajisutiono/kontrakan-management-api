import RefreshAuthentication from '../../Domains/authentications/entities/RefreshAuthentication.js'

class RefreshAuthenticationUseCase {
  constructor({
    authenticationRepository,
    tokenManager
  }) {
    this._authenticationRepository = authenticationRepository
    this._tokenManager = tokenManager
  }

  async execute(useCasePayload) {
    const { refreshToken } = new RefreshAuthentication(useCasePayload)
    
    await this._tokenManager.verifyRefreshToken(refreshToken)

    await this._authenticationRepository.checkAvailabilityToken(refreshToken)
    
    const { email, id } = await this._tokenManager.decodePayload(refreshToken)

    return this._tokenManager.createAccessToken({ email, id })
  }
}

export default RefreshAuthenticationUseCase