import { describe, expect, it, vi } from 'vitest'

import authMiddleware from '../authMiddleware.js'
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js'
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js'

describe('authMiddleware', () => {
  it('should call next without error when token valid', async() => {
    const mockTokenManager = {
      verifyAccessToken: vi.fn().mockResolvedValue(),
      decodePayload: vi.fn().mockResolvedValue({ id: 'user-123', role: 'owner' })
    }

    const mockContainer = {
      resolve: vi.fn().mockReturnValue(mockTokenManager)
    }

    const mockReq = { headers: { authorization: 'Bearer valid_token' }}
    const mockRes = {}
    const mockNext = vi.fn()

    await authMiddleware(mockContainer)(mockReq, mockRes, mockNext)

    expect(mockTokenManager.verifyAccessToken).toBeCalledWith('valid_token')
    expect(mockTokenManager.decodePayload).toBeCalledWith('valid_token')
    expect(mockReq.user).toEqual({ id: 'user-123', role: 'owner' })
    expect(mockNext).toBeCalledWith()
  })

  it('should call next with AuthenticationError when no authorization header', async () => {
    const mockContainer = { resolve: vi.fn() }
    const mockReq = { headers: {} }
    const mockRes = {}
    const mockNext = vi.fn()

    await authMiddleware(mockContainer)(mockReq, mockRes, mockNext)

    expect(mockNext).toBeCalledWith(expect.any(AuthenticationError))
  })

  it('should call next with AuthenticationError when format is not Bearer', async () => {
    const mockContainer = { resolve: vi.fn() }
    const mockReq = { headers: { authorization: 'Basic valid_token' } }
    const mockRes = {}
    const mockNext = vi.fn()

    await authMiddleware(mockContainer)(mockReq, mockRes, mockNext)

    expect(mockNext).toBeCalledWith(expect.any(AuthenticationError))
  })

  it('should call next with AuthorizationError when token invalid', async() => {
    const mockTokenManager = {
      verifyAccessToken: vi.fn().mockRejectedValue(new Error('invalid token'))
    }

    const mockContainer = {
      resolve: vi.fn().mockReturnValue(mockTokenManager)
    }

    const mockReq = { headers: { authorization: 'Bearer invalid_token'}}
    const mockRes = {}
    const mockNext = vi.fn()

    await authMiddleware(mockContainer)(mockReq, mockRes, mockNext)

    expect(mockNext).toBeCalledWith(expect.any(Error))
  })
})