/* istanbul ignore file */
import { createContainer, asValue, asClass, } from 'awilix'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'

import pool from './database/postgres'
import UserRepositoryPostgres from './repository/UserRepositoryPostgres'
import BcryptPasswordHash from './security/BcryptPasswordHash'
import RegexPasswordValidator from './security/RegexPasswordValidator'
import AddUserUseCase from '../Applications/use_case/AddUserUseCase'

const container = createContainer()

container.register({
  // External values
  pool: asValue(pool),
  bcrypt: asValue(bcrypt),
  idGenerator: asValue(randomUUID),

  // Repositories
  userRepository: asClass(UserRepositoryPostgres).singleton(),

  // Security
  bcryptPasswordHash: asClass(BcryptPasswordHash).singleton(),
  regexPasswordValidator: asClass(RegexPasswordValidator).singleton(),

  // Use cases
  addUserUseCase: asClass(AddUserUseCase).singleton(),
})

export default container