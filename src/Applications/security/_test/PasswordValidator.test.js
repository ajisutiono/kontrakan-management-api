import { describe, expect, it } from 'vitest'

import PasswordValidator from '../PasswordValidator.js'

describe('PasswordValidator interface', () => {
  it('should throw error when invoke abstract behavior', () => {
    const passwordValidator = new PasswordValidator()
    
    expect(() => passwordValidator.validate('Secr1T_wrongPassword')).toThrowError(
      'PASSWORD_VALIDATOR.METHOD_NOT_IMPLEMENTED',
    )
  })
})