import { Router } from 'express'

import authMiddleware from '../../middleware/authMiddleware.js'

const createBookingRouter = (controller, container) => {
  const router = Router()

  router.post('/', authMiddleware(container), controller.postBooking)

  return router
}

export default createBookingRouter