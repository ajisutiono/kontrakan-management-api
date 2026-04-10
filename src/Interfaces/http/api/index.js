import { Router } from 'express'

import createUsersApi from './users/index.js'
import createAuthenticationsApi from './authentications/index.js'
import createRoomApi from './rooms/index.js'

const createRouter = (container) => {
  const router = Router()

  router.use('/users', createUsersApi(container))
  router.use('/authentications', createAuthenticationsApi(container))
  router.use('/rooms', createRoomApi(container))

  return router
}

export default createRouter