import { describe, expect, it } from 'vitest'
import LoginUser from '../LoginUser'

describe('LoginUser entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      email: 'testing@example.com',
      // missing password
    }

    expect(() => new LoginUser(payload)).toThrowError('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload does not meet data type specification', () => {
    const payload = {
      email: 'testing@example.com',
      password: 12345678,
    }

    expect(() => new LoginUser(payload)).toThrow('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create LoginUser entities correctly', () => {
    const payload = {
      email: 'testing@example.com',
      password: 'Password1!',
    }

    const loginUser = new LoginUser(payload)

    expect(loginUser).toBeInstanceOf(LoginUser)
    expect(loginUser.email).toBe(payload.email)
    expect(loginUser.password).toBe(payload.password)
  })
})