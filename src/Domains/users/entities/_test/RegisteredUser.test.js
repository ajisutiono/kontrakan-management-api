import { describe, expect, it } from 'vitest'

import RegisteredUser from '../RegisteredUser.js'

describe('RegisteredUser entity', () => {
  it('throws if required property is missing', () => {
    const missing = {
      id: 'user-456',
      name: 'Bob',
      // role missing
    }
    expect(() => new RegisteredUser(missing)).toThrowError(
      'REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY',
    )
  })

  it('throws if data types are incorrect', () => {
    const badTypes = {
      id: 123,
      name: 'Bob',
      role: 'owner',
    }
    expect(() => new RegisteredUser(badTypes)).toThrowError(
      'REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION',
    )
  })

  it('throws if role is not owner or tenant', () => {
    const badRole = {
      id: 'user-789',
      name: 'Charlie',
      role: 'admin',
    }
    expect(() => new RegisteredUser(badRole)).toThrowError(
      'REGISTERED_USER.INVALID_ROLE',
    )
  })

  it('constructs correctly with valid payload', () => {
    const payload = {
      id: 'user-123',
      name: 'Alice',
      role: 'tenant',
    }

    const user = new RegisteredUser(payload)

    expect(user.id).toEqual(payload.id)
    expect(user.name).toEqual(payload.name)
    expect(user.role).toEqual(payload.role)
  })
})
