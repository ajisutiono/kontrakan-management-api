import { describe, expect, it } from 'vitest'
import DeleteAuthentication from '../DeleteAuthentication.js'

describe('DeleteAuthentication entities', () => {
  it('should throw error when refreshToken missing', () => {
    expect(() => new DeleteAuthentication({})).toThrowError('DELETE_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      refreshToken: 123
    }

    expect(() => new DeleteAuthentication(payload)).toThrowError('DELETE_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should DeleteAuthentication correctly', () => {
    const payload = {
      refreshToken: 'refresh_token'
    }

    const deleteAuthentication = new DeleteAuthentication(payload)

    expect(deleteAuthentication).toBeInstanceOf(DeleteAuthentication)
    expect(deleteAuthentication.refreshToken).toBe(payload.refreshToken)
  })
})