class LoginUser {
  constructor(payload) {
    this._validatePayload(payload)

    this.email = payload.email
    this.password = payload.password
  }

  _validatePayload({ email, password }) {
    if(!email || !password) {
      throw new Error('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

export default LoginUser