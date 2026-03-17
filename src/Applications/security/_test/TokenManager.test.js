import { describe, expect, it } from 'vitest'
import TokenManager from '../TokenManager.js'

describe('TokenManager interface', () => {
  const tokenManager = new TokenManager()

  it('createAccessToken should throw TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED', async () => {
    await expect(tokenManager.createAccessToken({})).rejects.toThrow(
      'TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    )
  })

  it('createRefreshToken should throw TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED', async () => {
    await expect(tokenManager.createRefreshToken({})).rejects.toThrow(
      'TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    )
  })

  it('verifyRefreshToken should throw TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED', async () => {
    await expect(tokenManager.verifyRefreshToken('token')).rejects.toThrow(
      'TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    )
  })

  it('decodePayload should throw TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED', async () => {
    await expect(tokenManager.decodePayload('token')).rejects.toThrow(
      'TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    )
  })
})