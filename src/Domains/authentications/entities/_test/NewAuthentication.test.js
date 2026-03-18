import { describe, expect, it } from 'vitest'

import NewAuthentication from '../NewAuthentication.js'

describe('NewAuthentication entities', () => {
  it('should throw error accessToken missing', () => {
    const payload = {
      // accessToken missing
      refreshToken: 'refresh_token',
    }

    expect(() => new NewAuthentication(payload)).toThrowError('NEW_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error refreshToken missing', () => {
    const payload = {
      accessToken: 'access_token',
      // missing refreshToken
    }

    expect(() => new NewAuthentication(payload)).toThrowError('NEW_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not needed data type specification', () => {
    const payload = {
      accessToken: true,
      refreshToken: 12345,
    }

    expect(() => new NewAuthentication(payload)).toThrowError('NEW_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewAuthentication correctly', () => {
    const payload = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    }

    const newAuthentication = new NewAuthentication(payload)
    
    expect(newAuthentication).toBeInstanceOf(NewAuthentication)
    expect(newAuthentication.accessToken).toBe(payload.accessToken)
    expect(newAuthentication.refreshToken).toBe(payload.refreshToken)
  })
})