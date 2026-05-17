import MyRoomsController from './controller.js'
import createMyRoomsRouter from './route.js'

const createMyRoomsApi = (container) => {
  const controller = new MyRoomsController(container)
  return createMyRoomsRouter(controller, container)
}

export default createMyRoomsApi