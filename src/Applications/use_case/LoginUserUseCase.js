import LoginUser from '../../Domains/users/entities/LoginUser.js'
import NewAuthentication from '../../Domains/authentications/entities/NewAuthentication.js'

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    tokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository
    this._authenticationRepository = authenticationRepository
    this._tokenManager = tokenManager
    this._passwordHash = passwordHash
  }


  async execute(useCasePayload) {
    const { email, password } = new LoginUser(useCasePayload)

    const encryptedPassword = await this._userRepository.getPasswordByEmail(email)

    await this._passwordHash.comparePassword(password, encryptedPassword)

    const id = await this._userRepository.getIdByEmail(email)

    const accessToken = await this._tokenManager.createAccessToken({ email, id })
    const refreshToken = await this._tokenManager.createRefreshToken({ email, id })

    const newAuthentication = new NewAuthentication({
      accessToken,
      refreshToken
    })

    await this._authenticationRepository.addToken(newAuthentication.refreshToken)

    return newAuthentication
  }
}

export default LoginUserUseCase