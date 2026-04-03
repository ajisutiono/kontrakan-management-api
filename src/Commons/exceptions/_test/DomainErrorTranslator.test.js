import { describe, expect, it } from 'vitest'

import DomainErrorTranslator from '../DomainErrorTranslator.js'
import InvariantError from '../InvariantError.js'

describe('DomainErrorTranslator', () => {

  describe('translate', () => {
    it('should translate REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY correctly', () => {
      const error = new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada')
    })

    it('should translate REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION correctly', () => {
      const error = new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena tipe data tidak sesuai')
    })

    it('should translate REGISTER_USER.NAME_TOO_LONG correctly', () => {
      const error = new Error('REGISTER_USER.NAME_TOO_LONG')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena nama terlalu panjang')
    })

    it('should translate REGISTER_USER.EMAIL_TOO_LONG correctly', () => {
      const error = new Error('REGISTER_USER.EMAIL_TOO_LONG')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena email terlalu panjang')
    })

    it('should translate REGISTER_USER.PASSWORD_BELOW_MINIMUM_LENGTH correctly', () => {
      const error = new Error('REGISTER_USER.PASSWORD_BELOW_MINIMUM_LENGTH')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena password terlalu pendek')
    })

    it('should translate REGISTER_USER.INVALID_EMAIL correctly', () => {
      const error = new Error('REGISTER_USER.INVALID_EMAIL')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena format email tidak valid')
    })

    it('should translate REGISTER_USER.INVALID_ROLE correctly', () => {
      const error = new Error('REGISTER_USER.INVALID_ROLE')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena role tidak valid')
    })

    it('should translate REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER correctly', () => {
      const error = new Error('REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('tidak dapat membuat user baru karena nama mengandung karakter terlarang')
    })

    // 500 error
    it('should return the same error when error message is not recognized', () => {
      const error = new Error('UNKNOWN_ERROR')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBe(error)
    })

    it('should return the same error when error is already a ClientError', () => {
      const error = new InvariantError('some invariant error')
      const translatedError = DomainErrorTranslator.translate(error)

      expect(translatedError).toBe(error)
    })

    it('should translate LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY', () => {
      const error = new Error('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('harus memasukkan email dan password')
    })

    it('should translate LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION', () => {
      const error = new Error('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('email dan password harus string')
    })

    // Authentication Errors
    it('should translate REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY', () => {
      const error = new Error('REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('property yang dibutuhkan tidak ada')
    })

    it('should translate REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION', () => {
      const error = new Error('REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('harus memasukkan tipe data yang sesuai')
    })

    it('should translate DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY', () => {
      const error = new Error('DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('property yang dibutuhkan tidak ada')
    })

    it('should translate DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION', () => {
      const error = new Error('DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
      const translatedError = DomainErrorTranslator.translate(error)
      expect(translatedError).toBeInstanceOf(InvariantError)
      expect(translatedError.message).toBe('harus memasukkan tipe data yang sesuai')
    })
  })
})