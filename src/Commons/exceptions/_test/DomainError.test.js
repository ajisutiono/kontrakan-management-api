import { describe, it, expect } from 'vitest'

import DomainError from '../DomainError.js'

describe('DomainError', () => {
  it('should create instance with correct message and name', () => {
    const error = new DomainError('test message')

    expect(error).toBeInstanceOf(DomainError)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('test message')
    expect(error.name).toBe('DomainError')
  })

  it('should be extendable as base class', () => {
    class TestSubclass extends DomainError {}
    const instance = new TestSubclass('message')

    expect(instance).toBeInstanceOf(DomainError)
    expect(instance).toBeInstanceOf(Error)
  })
})