class NewAuthentication {
  constructor(payload) {
    this._validatePayload(payload)

    this.accessToken = payload.accessToken
    this.refreshToken = payload.refreshToken
  }

  _validatePayload({ accessToken, refreshToken }) {
    if (!accessToken || !refreshToken) {
      throw new Error('NEW_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new Error('NEW_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

export default NewAuthentication