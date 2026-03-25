import { afterAll, afterEach, describe, expect, it } from 'vitest'

import pool from '../../database/postgres/pool.js'
import AuthenticationRepositoryPostgres from '../AuthenticationRepositoryPostgres.js'
import InvariantError from '../../../Commons/exceptions/InvariantError.js'
import AuthencticationTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js'

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async() => {
    await AuthencticationTableTestHelper.cleanTable()
  })

  afterAll(async() => {
    await pool.end()
  })

  describe('addToken function', () => {
    it('should add token to database', async() => {
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres({pool})
      const token = 'token'

      await authenticationRepositoryPostgres.addToken(token)

      const tokens = await AuthencticationTableTestHelper.findToken(token)

      expect(tokens).toHaveLength(1)
      expect(tokens[0].token).toBe(token)
    })
  })

  describe('checkAvailableToken function', () => {
    it('should throw InvariantError when token unavailable', async() => {
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres({pool})
      
      await expect(authenticationRepositoryPostgres.checkAvailableToken(''))
        .rejects
        .toThrowError('refresh token tidak ditemukan')
      await expect(authenticationRepositoryPostgres.checkAvailableToken(''))
        .rejects
        .toBeInstanceOf(InvariantError)
    })

    it('should not throw InvariantError when tooken available', async() => {
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres({pool})
      const token = 'refresh_token'

      await AuthencticationTableTestHelper.addToken(token)

      await expect(authenticationRepositoryPostgres.checkAvailableToken(token))
        .resolves
        .not.toThrow(InvariantError)
    })
  })

  describe('deleteToken function', () => {
    it('should delete token from database', async() => {
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres({pool})
      const token = 'refresh_token'

      await AuthencticationTableTestHelper.addToken(token)

      await authenticationRepositoryPostgres.deleteToken(token)

      const tokens = await AuthencticationTableTestHelper.findToken(token)
      expect(tokens).toHaveLength(0)
    })
  })
})