import MyRoomsController from './controller'
import createMyRoomRouter from './route'

const createMyRoomApi = (container) => {
  const controller = new MyRoomsController(container)
  return createMyRoomRouter(controller, container)
}

export default createMyRoomApi