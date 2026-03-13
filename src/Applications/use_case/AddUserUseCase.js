import RegisterUser from '../../Domains/users/entities/RegisterUser'
import RegisteredUser from '../../Domains/users/entities/RegisteredUser'

class AddUserUseCase {
  constructor({ userRepository, passwordHash, passwordValidator }) {
    this._userRepository = userRepository
    this._passwordHash = passwordHash
    this._passwordValidator = passwordValidator
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload)
    await this._userRepository.verifyAvailableEmail(registerUser.email)
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