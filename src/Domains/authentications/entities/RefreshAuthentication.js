class RefreshAuthentication {
  constructor(payload) {
    this._validatePayload(payload)

    this.refreshToken = payload.refreshToken
  }

  _validatePayload({refreshToken}) {
    if(!refreshToken) {
      throw new Error('REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof refreshToken !== 'string') {
      throw new Error('REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

export default RefreshAuthentication