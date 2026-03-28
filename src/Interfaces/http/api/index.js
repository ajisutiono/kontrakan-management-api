import { Router } from 'express'

import createUsersApi from './users/index.js'
import createAuthenticationsApi from './authentications/index.js'

const createRouter = (container) => {
  const router = Router()

  router.use('/users', createUsersApi(container))
  router.use('/authentications', createAuthenticationsApi(container))

  return router
}

export default createRouter