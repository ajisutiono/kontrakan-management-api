import InvariantError from './InvariantError.js'

const DomainErrorTranslator = {
  translate(error) {
    switch (error.message) {
    // RegisterUser errors
    case 'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY':
      return new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada')
    case 'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION':
      return new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai')
    case 'REGISTER_USER.NAME_TOO_LONG':
      return new InvariantError('tidak dapat membuat user baru karena nama terlalu panjang')
    case 'REGISTER_USER.EMAIL_TOO_LONG':
      return new InvariantError('tidak dapat membuat user baru karena email terlalu panjang')
    case 'REGISTER_USER.PASSWORD_BELOW_MINIMUM_LENGTH':
      return new InvariantError('tidak dapat membuat user baru karena password terlalu pendek')
    case 'REGISTER_USER.INVALID_EMAIL':
      return new InvariantError('tidak dapat membuat user baru karena format email tidak valid')
    case 'REGISTER_USER.INVALID_ROLE':
      return new InvariantError('tidak dapat membuat user baru karena role tidak valid')
    case 'REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER':
      return new InvariantError('tidak dapat membuat user baru karena nama mengandung karakter terlarang')

    // LoginUser errors
    case 'LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY':
      return new InvariantError('harus memasukkan email dan password')
    case 'LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION':
      return new InvariantError('email dan password harus string')

    // Authentication errors
    case 'REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY':
      return new InvariantError('harus memasukkan tokne yang benar')
    case 'REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION':
      return new InvariantError('token harus string')
    default:
      return error
    }
  },
}

export default DomainErrorTranslator