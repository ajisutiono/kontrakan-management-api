import RoomsController from './controller.js'
import createRoomRouter from './route.js'

const createRoomApi = (container) => {
  const controller = new RoomsController(container)
  return createRoomRouter(controller, container)
}

export default createRoomApi