import config from '../../Commons/config.js'
import InvariantError from '../../Commons/exceptions/InvariantError.js'
import TokenManager from '../../Applications/security/TokenManager.js'

class JwtTokenManager extends TokenManager {
  constructor({jwt}) {
    super()
    this._jwt = jwt
  }

  async createAccessToken(payload){
    return this._jwt.sign(payload, config.token.accessTokenKey)
  }

  async createRefreshToken(payload) {
    return this._jwt.sign(payload, config.token.refreshTokenKey)
  }

  async verifyRefreshToken(token) {
    try {
      this._jwt.verify(token, config.token.refreshTokenKey)
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new InvariantError('refresh token tidak valid')
    }
  }

  async decodePayload(token) {
    return this._jwt.decode(token)
  }
}

export default JwtTokenManager
