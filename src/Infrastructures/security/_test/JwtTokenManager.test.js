import { describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'

import config from '../../../Commons/config.js'
import InvariantError from '../../../Commons/exceptions/InvariantError.js'
import JwtTokenManager from '../JwtTokenManager.js'

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async() => {
      const payload = {
        email: 'testing@mail.com'
      }

      const mockJwtToken = {
        sign: vi.fn().mockImplementation(() => 'mock_token')
      }

      const jwtTokenManager = new JwtTokenManager({jwt: mockJwtToken})

      const accessToken = await jwtTokenManager.createAccessToken(payload)

      expect(mockJwtToken.sign).toBeCalledWith(payload, config.token.accessTokenKey)
      expect(accessToken).toBe('mock_token')
    })
  })

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async() => {
      const payload = {
        email: 'testing@mail.com'
      }

      const mockJwtToken = {
        sign: vi.fn().mockImplementation(() => 'mock_token')
      }

      const jwtTokenManager = new JwtTokenManager({jwt: mockJwtToken})

      const accessToken = await jwtTokenManager.createRefreshToken(payload)

      expect(mockJwtToken.sign).toBeCalledWith(payload, config.token.refreshTokenKey)
      expect(accessToken).toBe('mock_token')
    })
  })

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // pakai spyOn — jwt asli tapi kita paksa throw
      const jwtTokenManager = new JwtTokenManager({jwt})
      vi.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('invalid token')
      })

      await expect(jwtTokenManager.verifyRefreshToken('invalid_token'))
        .rejects.toThrowError('refresh token tidak valid')
      await expect(jwtTokenManager.verifyRefreshToken('invalid_token'))
        .rejects.toBeInstanceOf(InvariantError)
    })

    it('should not throw when refresh token valid', async () => {
      // pakai spyOn — jwt asli tapi kita paksa sukses
      const jwtTokenManager = new JwtTokenManager({jwt})
      vi.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ email: 'testing@mail.com' }))

      await expect(jwtTokenManager.verifyRefreshToken('valid_token'))
        .resolves.not.toThrow()
    })
  })

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      const payload = { email: 'testing@mail.com' }
      const mockJwtToken = {
        decode: vi.fn().mockReturnValue(payload)
      }
      const jwtTokenManager = new JwtTokenManager({jwt: mockJwtToken})

      const decoded = await jwtTokenManager.decodePayload('some_token')

      expect(mockJwtToken.decode).toBeCalledWith('some_token')
      expect(decoded).toEqual(payload)
    })
  })
})
