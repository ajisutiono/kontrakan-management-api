import { describe, expect, it } from 'vitest'

import RegisterUser from '../RegisterUser'

describe('RegisterUser entity', () => {
  it('throws when any required property is missing', () => {
    const payload = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'anotherPass',
      // role missing
    }
    expect(() => new RegisterUser(payload)).toThrowError(
      'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY',
    )
  })

  it('throws when data types are incorrect', () => {
    const payload = {
      name: 123,
      email: 'jane@example.com',
      password: 'password',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payload)).toThrowError(
      'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION',
    )
  })

  it('throws when name or email exceeds maximum length', () => {
    const payload = {
      name: 'a'.repeat(101),
      email: 'a'.repeat(101) + '@example.com',
      password: 'securePass1',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payload)).toThrowError(
      'REGISTER_USER.NOT_MEET_DATA_LENGTH_REQUIREMENT',
    )
  })

  it('throws when password is less than 8 characters', () => {
    const payload = {
      name: 'Jane',
      email: 'jane@example.com',
      password: '1234567',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payload)).toThrowError(
      'REGISTER_USER.NOT_MEET_DATA_LENGTH_REQUIREMENT',
    )
  })

  it('rejects invalid email format', () => {
    const payloadBadEmail = {
      name: 'Jane',
      email: 'janeexample.com',
      password: 'securePass1',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payloadBadEmail)).toThrowError(
      'REGISTER_USER.INVALID_EMAIL',
    )
  })

  it('rejects invalid role value', () => {
    const payloadBadRole = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'securePass1',
      role: 'admin',
    }
    expect(() => new RegisterUser(payloadBadRole)).toThrowError(
      'REGISTER_USER.INVALID_ROLE',
    )
  })

  it('rejects name with restricted characters', () => {
    const payload = {
      name: 'Jane@Doe',
      email: 'jane@example.com',
      password: 'securePass1',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payload)).toThrowError(
      'REGISTER_USER.NAME_CONTAIN_RESTRICTED_CHARACTER',
    )
  })

  it('accepts password with exactly 8 characters', () => {
    const payload = {
      name: 'Jane',
      email: 'jane@example.com',
      password: '12345678',
      role: 'tenant',
    }
    expect(() => new RegisterUser(payload)).not.toThrow()
  })

  it('creates correctly with valid payload', () => {
    const payload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePass1',
      role: 'owner',
    }

    const user = new RegisterUser(payload)

    expect(user.name).toEqual(payload.name)
    expect(user.email).toEqual(payload.email)
    expect(user.password).toEqual(payload.password)
    expect(user.role).toEqual(payload.role)
  })
})
