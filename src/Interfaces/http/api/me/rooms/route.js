import { Router } from 'express'

import authMiddleware from '../../../middleware/authMiddleware.js'

const createMyRoomRouter = (controller, container) => {
  const router = Router()

  router.get('/', authMiddleware(container), controller.getMyRooms)

  return router
}

export default createMyRoomRouter