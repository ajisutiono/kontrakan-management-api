import { Router } from 'express'

import authMiddleware from '../../../middleware/authMiddleware'

const createMyRoomRouter = (controller, container) => {
  const router = Router()

  router.get('/', authMiddleware(container), controller.getMyRooms)
}

export default createMyRoomRouter