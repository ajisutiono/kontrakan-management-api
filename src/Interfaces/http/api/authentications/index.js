import AuthenticationsController from './controller.js'
import createAuthenticationsRouter from './route.js'

const createAuthenticationsApi = (container) => {
  const controller = new AuthenticationsController(container)
  return createAuthenticationsRouter(controller)
}

export default createAuthenticationsApi