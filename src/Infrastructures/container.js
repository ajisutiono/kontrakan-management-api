/* istanbul ignore file */
import { createContainer, asValue, asClass, } from 'awilix'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import pool from './database/postgres/pool.js'

// repository
import UserRepositoryPostgres from './repository/UserRepositoryPostgres.js'
import AuthenticationRepositoryPostgres from './repository/AuthenticationRepositoryPostgres.js'

// security
import BcryptPasswordHash from './security/BcryptPasswordHash.js'
import RegexPasswordValidator from './security/RegexPasswordValidator.js'
import JwtTokenManager from './security/JwtTokenManager.js'

// use case
import AddUserUseCase from '../Applications/use_case/AddUserUseCase.js'
import LoginUserUseCase from '../Applications/use_case/LoginUserUseCase.js'

const container = createContainer()

container.register({
  // External values
  pool: asValue(pool),
  bcrypt: asValue(bcrypt),
  idGenerator: asValue(randomUUID),
  saltRound: asValue(10),
  jwt: asValue(jwt),

  // Repositories
  userRepository: asClass(UserRepositoryPostgres).singleton(),
  authenticationRepository: asClass(AuthenticationRepositoryPostgres).singleton(),

  // Security
  passwordHash: asClass(BcryptPasswordHash).singleton(),
  passwordValidator: asClass(RegexPasswordValidator).singleton(),
  tokenManager: asClass(JwtTokenManager).singleton(),

  // Use cases
  addUserUseCase: asClass(AddUserUseCase).singleton(),
  loginUserUseCase: asClass(LoginUserUseCase).singleton(),

})

export default container