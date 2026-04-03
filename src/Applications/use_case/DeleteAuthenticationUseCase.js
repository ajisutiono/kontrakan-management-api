import DeleteAuthentication from '../../Domains/authentications/entities/DeleteAuthentication.js'

class DeleteAuthenticationUseCase {
  constructor({
    authenticationRepository
  }) {
    this._authenticationRepository = authenticationRepository
  }

  async execute(useCasePayload) {
    const { refreshToken } = new DeleteAuthentication(useCasePayload)

    await this._authenticationRepository.checkAvailabilityToken(refreshToken)
    await this._authenticationRepository.deleteToken(refreshToken)
  }
}

export default DeleteAuthenticationUseCase