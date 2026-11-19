import MyBookingsController from './controller.js'
import createMyBookingsRouter from './route.js'

const createMyBookingsApi = (container) => {
  const controller = new MyBookingsController(container)
  return createMyBookingsRouter(controller, container)
}

export default createMyBookingsApi