import { Router } from 'express'

import authMiddleware from '../../../middleware/authMiddleware.js'

const createMyBookingsRouter = (controller, container) => {
  const router = Router()

  router.get('/', authMiddleware(container), controller.getMyBookings)

  return router
}

export default createMyBookingsRouter