import { Router } from 'express'

const createAuthenticationsRouter = (controller) => {
  const router = Router()

  router.post('/', controller.postAuthentication)
  router.put('/', controller.putAuthentication)

  return router
}

export default createAuthenticationsRouter