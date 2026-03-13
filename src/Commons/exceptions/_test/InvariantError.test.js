import { describe, expect, it } from 'vitest'

import InvariantError from '../InvariantError.js'

describe('InvariantError', () => {
  it('should create an error correctly', () => {
    const invariantError = new InvariantError('invariant violation occurred')

    expect(invariantError.statusCode).toEqual(400)
    expect(invariantError.message).toEqual('invariant violation occurred')
    expect(invariantError.name).toEqual('InvariantError')
    expect(invariantError).toBeInstanceOf(Error)
  })
})

export default InvariantError