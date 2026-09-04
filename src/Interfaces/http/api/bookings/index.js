import BookingsController from './controller.js'
import createBookingRouter from './route.js'

const createBookingApi = (container) => {
  const controller = new BookingsController(container)
  return createBookingRouter(controller, container)
}

export default createBookingApi