import { Router } from 'express'

import authMiddleware from '../../middleware/authMiddleware.js'

const createRoomRouter = (controller, container) => {
  const router = Router()

  router.post('/', authMiddleware(container), controller.postRoom)
  router.get('/', authMiddleware(container), controller.getRooms)
  router.get('/:id', authMiddleware(container), controller.getRoomById)
  router.put('/:id', authMiddleware(container), controller.updateRoomById)
  router.delete('/:id', authMiddleware(container), controller.deleteRoomById)

  return router
}

export default createRoomRouter