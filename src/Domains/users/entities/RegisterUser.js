class RegisterUser {
  constructor(payload) {
    this._validatePayload(payload);

    const { name, email, password, role } = payload;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  _validatePayload({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      throw new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string'
    ) {
      throw new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (name.length > 100 || email.length > 100 || password.length < 8) {
      throw new Error('REGISTER_USER.NOT_MEET_DATA_LENGTH_REQUIREMENT');
    }

    if (!email.includes('@')) {
      throw new Error('REGISTER_USER.INVALID_EMAIL');
    }

    if (!['owner', 'tenant'].includes(role)) {
      throw new Error('REGISTER_USER.INVALID_ROLE');
    }

    if (!name.match(/^[\w\s'.-]+$/)) {
      throw new Error('REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER');
    }
  }
}

export default RegisterUser;