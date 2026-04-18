import { Router } from 'express'

import authMiddleware from '../../middleware/authMiddleware.js'

const createRoomRouter = (controller, container) => {
  const router = Router()

  router.post('/', authMiddleware(container), controller.postRoom)
  router.get('/', authMiddleware(container), controller.getRooms)

  return router
}

export default createRoomRouter