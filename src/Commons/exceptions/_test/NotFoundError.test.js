import { describe, expect, it } from 'vitest'

import NotFoundError from '../NotFoundError.js'

describe('NotFoundError', () => {
  it('should create an not found error correctly', () => {
    const notFoundError = new NotFoundError('not found error')

    expect(notFoundError.message).toEqual('not found error')
    expect(notFoundError.statusCode).toEqual(404)
    expect(notFoundError.name).toEqual('NotFoundError')
    expect(notFoundError).toBeInstanceOf(Error)
  })
})