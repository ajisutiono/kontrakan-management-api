import { describe, expect, it } from 'vitest'

import AuthorizationError from '../AuthorizationError.js'

describe('AuthorizationError', () => {
  it('should create an authorization error correctly', () => {
    const authorizationError = new AuthorizationError('authorization error')

    expect(authorizationError.message).toEqual('authorization error')
    expect(authorizationError.statusCode).toEqual(403)
    expect(authorizationError.name).toEqual('AuthorizationError')
    expect(authorizationError).toBeInstanceOf(Error)
  })
})