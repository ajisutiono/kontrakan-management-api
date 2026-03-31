import RegisterUser from '../../Domains/users/entities/RegisterUser.js'
import RegisteredUser from '../../Domains/users/entities/RegisteredUser.js'

class AddUserUseCase {
  constructor({ userRepository, passwordHash, passwordValidator }) {
    this._userRepository = userRepository
    this._passwordHash = passwordHash
    this._passwordValidator = passwordValidator
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload)
    await this._userRepository.verifyAvailabilityEmail(registerUser.email)
    this._passwordValidator.validate(registerUser.password)
    const hashedPassword = await this._passwordHash.hash(registerUser.password)
    
    const registeredUser = await this._userRepository.addUser({
      ...registerUser,
      password: hashedPassword,
    })

    return new RegisteredUser(registeredUser)
  }
}

export default AddUserUseCase