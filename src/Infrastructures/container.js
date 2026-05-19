/* istanbul ignore file */
import { createContainer, asValue, asClass, } from 'awilix'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import pool from './database/postgres/pool.js'

// repository
import UserRepositoryPostgres from './repository/UserRepositoryPostgres.js'
import AuthenticationRepositoryPostgres from './repository/AuthenticationRepositoryPostgres.js'
import RoomRepositoryPostgres from './repository/RoomRepositoryPostgres.js'

// security
import BcryptPasswordHash from './security/BcryptPasswordHash.js'
import RegexPasswordValidator from './security/RegexPasswordValidator.js'
import JwtTokenManager from './security/JwtTokenManager.js'

// use case
import AddUserUseCase from '../Applications/use_case/AddUserUseCase.js'
import LoginUserUseCase from '../Applications/use_case/LoginUserUseCase.js'
import RefreshAuthenticationUseCase from '../Applications/use_case/RefreshAuthenticationUseCase.js'
import DeleteAuthenticationUseCase from '../Applications/use_case/DeleteAuthenticationUseCase.js'
import AddRoomUseCase from '../Applications/use_case/AddRoomUseCase.js'
import GetRoomsUseCase from '../Applications/use_case/GetRoomsUseCase.js'
import GetMyRoomsUseCase from '../Applications/use_case/GetMyRoomsUseCase.js'
import GetRoomUseCase from '../Applications/use_case/GetRoomUseCase.js'

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
  roomRepository: asClass(RoomRepositoryPostgres).singleton(),

  // Security
  passwordHash: asClass(BcryptPasswordHash).singleton(),
  passwordValidator: asClass(RegexPasswordValidator).singleton(),
  tokenManager: asClass(JwtTokenManager).singleton(),

  // Use cases
  addUserUseCase: asClass(AddUserUseCase).singleton(),
  loginUserUseCase: asClass(LoginUserUseCase).singleton(),
  refreshAuthenticationUseCase: asClass(RefreshAuthenticationUseCase).singleton(),
  deleteAuthenticationUseCase: asClass(DeleteAuthenticationUseCase).singleton(),
  addRoomUseCase: asClass(AddRoomUseCase).singleton(),
  getRoomsUseCase: asClass(GetRoomsUseCase).singleton(), // get rooms 
  getMyRoomUseCase: asClass(GetMyRoomsUseCase).singleton(),
  getRoomUseCase: asClass(GetRoomUseCase).singleton(), // get room by id
})

export default container