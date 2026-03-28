import { Router } from 'express'

const createAuthenticationsRouter = (controller) => {
  const router = Router()

  router.post('/', controller.postAuthentication)

  return router
}

export default createAuthenticationsRouter