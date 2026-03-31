import { describe, expect, it } from 'vitest'
import RefreshAuthentication from '../RefreshAuthentication.js'

describe('RefreshAuthentication entities', () => {
  it('should throw error when refreshToken missing', () => {
    expect(() => new RefreshAuthentication({})).toThrowError('REFRESH_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      refreshToken: true
    }

    expect(() => new RefreshAuthentication(payload)).toThrowError('REFRESH_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create RefreshAuthentication correctly', () => {
    const payload = {
      refreshToken: 'refresh_token'
    }

    const refreshAuthentication = new RefreshAuthentication(payload)

    expect(refreshAuthentication).toBeInstanceOf(RefreshAuthentication)
    expect(refreshAuthentication.refreshToken).toBe(payload.refreshToken)
  })
})