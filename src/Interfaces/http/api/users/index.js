import UsersController from './controller.js'
import createUsersRouter from './route.js'

const createUsersApi = (container) => {
  const controller = new UsersController(container)
  return createUsersRouter(controller)
}

export default createUsersApi