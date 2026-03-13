import { Router } from 'express'

const createUsersRouter = (controller) => {
  const router = Router()

  router.post('/', controller.postUser)

  return router
}

export default createUsersRouter