import DomainError from '../../../Commons/exceptions/DomainError.js'

class RegisteredUser {
  constructor(payload) {
    this._validatePayload(payload)

    const { id, name, role } = payload
    this.id = id
    this.name = name
    this.role = role
  }

  _validatePayload({ id, name, role }) {
    if (!id || !name || !role) {
      throw new DomainError('REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof name !== 'string' ||
      typeof role !== 'string'
    ) {
      throw new DomainError('REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }

    if (!['owner', 'tenant'].includes(role)) {
      throw new Error('REGISTERED_USER.INVALID_ROLE')
    }
  }
}

export default RegisteredUser