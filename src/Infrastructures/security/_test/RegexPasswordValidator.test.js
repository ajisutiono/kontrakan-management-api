import { beforeEach, describe, expect, it } from 'vitest';

import InvariantError from '../../../Commons/exceptions/InvariantError';
import RegexPasswordValidator from '../RegexPasswordValidator';

describe('RegexPasswordValidator', () => {
  let regexPasswordValidator;

  beforeEach(() => {
    regexPasswordValidator = new RegexPasswordValidator();
  });
  
  // failed scenarios
  it('should throw InvariantError when password has no uppercase letter', () => {
    expect(() => regexPasswordValidator.validate('password1!'))
      .toThrowError('REGEX_PASSWORD_VALIDATOR.MISSING_UPPERCASE');
    expect(() => regexPasswordValidator.validate('password1!'))
      .toThrow(InvariantError);
  });

  it('should throw InvariantError when password has no number', () => {
    expect(() => regexPasswordValidator.validate('Password!'))
      .toThrowError('REGEX_PASSWORD_VALIDATOR.MISSING_NUMBER');
    expect(() => regexPasswordValidator.validate('Password!'))
      .toThrow(InvariantError);
  });

  it('should throw InvariantError when password has no symbol', () => {
    expect(() => regexPasswordValidator.validate('Password1'))
      .toThrowError('REGEX_PASSWORD_VALIDATOR.MISSING_SYMBOL');
    expect(() => regexPasswordValidator.validate('Password1'))
      .toThrow(InvariantError);
  });

  // success scenarios
  it('should not throw when password meets all requirements', () => {
    expect(() => regexPasswordValidator.validate('Password1!'))
      .not.toThrow();
  });

  it('should not throw when password has exactly one uppercase, one number, one symbol', () => {
    expect(() => regexPasswordValidator.validate('aaaaaA1!'))
      .not.toThrow();
  });

  it('should not throw with various valid password formats', () => {
    const validPasswords = [
      'Abcdef1@',       // symbol at the end
      'MyP4ss#word',    // symbil in the middle
      'Secr3t_Pass',    // underscore as a symbol
      '1Password!',     // number at the beginning
      'P@ssw0rd',       // general pattern
    ];

    validPasswords.forEach((password) => {
      expect(() => regexPasswordValidator.validate(password))
        .not.toThrow();
    });
  });
});