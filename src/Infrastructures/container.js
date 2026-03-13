/* istanbul ignore file */
import { createContainer, asValue, asClass, } from 'awilix'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'

import pool from './database/postgres/pool.js'
import UserRepositoryPostgres from './repository/UserRepositoryPostgres.js'
import BcryptPasswordHash from './security/BcryptPasswordHash.js'
import RegexPasswordValidator from './security/RegexPasswordValidator.js'
import AddUserUseCase from '../Applications/use_case/AddUserUseCase.js'

const container = createContainer()

container.register({
  // External values
  pool: asValue(pool),
  bcrypt: asValue(bcrypt),
  idGenerator: asValue(randomUUID),
  saltRound: asValue(10),

  // Repositories
  userRepository: asClass(UserRepositoryPostgres).singleton(),

  // Security
  passwordHash: asClass(BcryptPasswordHash).singleton(),
  passwordValidator: asClass(RegexPasswordValidator).singleton(),

  // Use cases
  addUserUseCase: asClass(AddUserUseCase).singleton(),
})

export default container