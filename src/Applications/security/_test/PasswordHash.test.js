import { describe, expect, it } from 'vitest'

import PasswordHash from '../PasswordHash'

describe('PasswordHash interface', () => {
  it('should throw error when invoke abstract behavior', async() => {
    const passwordHash = new PasswordHash()
    const hashedPassword = 'hashed_password'

    await expect(passwordHash.hash('secret_password')).rejects.toThrowError('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED')
    await expect(passwordHash.comparePassword('hashed_password', hashedPassword)).rejects.toThrowError('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED')
  })
})