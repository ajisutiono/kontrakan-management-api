class DeleteAuthentication {
  constructor(payload) {
    this._validatePayload(payload)

    this.refreshToken = payload.refreshToken
  }

  _validatePayload({refreshToken}) {
    if(!refreshToken) {
      throw new Error('DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if(typeof refreshToken !== 'string') {
      throw new Error('DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

export default DeleteAuthentication