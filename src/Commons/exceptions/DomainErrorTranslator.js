import InvariantError from './InvariantError.js'

const DomainErrorTranslator = {
  translate(error) {
    switch (error.message) {
    // RegisterUser errors
    case 'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY':
      return new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada')
    case 'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION':
      return new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai')
    case 'REGISTER_USER.NOT_MEET_DATA_LENGTH_REQUIREMENT':
      return new InvariantError('tidak dapat membuat user baru karena panjang karakter tidak sesuai')
    case 'REGISTER_USER.INVALID_EMAIL':
      return new InvariantError('tidak dapat membuat user baru karena format email tidak valid')
    case 'REGISTER_USER.INVALID_ROLE':
      return new InvariantError('tidak dapat membuat user baru karena role tidak valid')
    case 'REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER':
      return new InvariantError('tidak dapat membuat user baru karena nama mengandung karakter terlarang')
    default:
      return error
    }
  },
}

export default DomainErrorTranslator