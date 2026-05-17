import { Router } from 'express'

import authMiddleware from '../../../middleware/authMiddleware.js'

const createMyRoomsRouter = (controller, container) => {
  const router = Router()

  router.get('/', authMiddleware(container), controller.getMyRooms)

  return router
}

export default createMyRoomsRouter