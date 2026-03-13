import { Router } from 'express'

import createUsersApi from './users/index.js'

const createRouter = (container) => {
  const router = Router()

  router.use('/users', createUsersApi(container))

  return router
}

export default createRouter