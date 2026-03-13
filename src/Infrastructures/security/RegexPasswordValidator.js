import PasswordValidator from '../../Applications/security/PasswordValidator'
import InvariantError from '../../Commons/exceptions/InvariantError'

class RegexPasswordValidator extends PasswordValidator {
  validate(password) {
    if (!/[A-Z]/.test(password)) {
      throw new InvariantError('REGEX_PASSWORD_VALIDATOR.MISSING_UPPERCASE')
    }

    if (!/[0-9]/.test(password)) {
      throw new InvariantError('REGEX_PASSWORD_VALIDATOR.MISSING_NUMBER')
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new InvariantError('REGEX_PASSWORD_VALIDATOR.MISSING_SYMBOL')
    }
  }
}

export default RegexPasswordValidator