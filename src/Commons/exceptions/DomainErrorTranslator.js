import InvariantError from './InvariantError.js'

const DomainErrorTranslator = {
  _errorMap: {
    // RegisterUser errors
    'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
    'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
    'REGISTER_USER.NAME_TOO_LONG': new InvariantError('tidak dapat membuat user baru karena nama terlalu panjang'),
    'REGISTER_USER.EMAIL_TOO_LONG': new InvariantError('tidak dapat membuat user baru karena email terlalu panjang'),
    'REGISTER_USER.PASSWORD_BELOW_MINIMUM_LENGTH': new InvariantError('tidak dapat membuat user baru karena password terlalu pendek'),
    'REGISTER_USER.INVALID_EMAIL': new InvariantError('tidak dapat membuat user baru karena format email tidak valid'),
    'REGISTER_USER.INVALID_ROLE': new InvariantError('tidak dapat membuat user baru karena role tidak valid'),
    'REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena nama mengandung karakter terlarang'),

    // LoginUser errors
    'LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus memasukkan email dan password'),
    'LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('email dan password harus string'),

    // Authentication errors
    'REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('property yang dibutuhkan tidak ada'),
    'REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('harus memasukkan tipe data yang sesuai'),
    'DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('property yang dibutuhkan tidak ada'),
    'DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('harus memasukkan tipe data yang sesuai'),
  },

  translate(error) {
    return this._errorMap[error.message] ?? error
  },
}

export default DomainErrorTranslator