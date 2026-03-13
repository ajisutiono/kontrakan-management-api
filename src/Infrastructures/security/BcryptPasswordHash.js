import PasswordHash from '../../Applications/security/PasswordHash.js'
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js'

class BcryptPasswordHash extends PasswordHash {
  constructor({ bcrypt, saltRound = 10 }) {
    super()
    this._bcrypt = bcrypt
    this._saltRound = saltRound
  }

  async hash(password) {
    return this._bcrypt.hash(password, this._saltRound)
  }

  async comparePassword(password, hashedPassword) {
    const isMatch = await this._bcrypt.compare(password, hashedPassword)

    if (!isMatch) {
      throw new AuthenticationError('BCRYPT_PASSWORD_HASH.PASSWORD_NOT_MATCH')
    }
  }
}

export default BcryptPasswordHash