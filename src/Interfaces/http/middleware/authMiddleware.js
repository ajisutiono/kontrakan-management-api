import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js'

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const tokenManager = container.resolve('tokenManager')
    
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.split(' ')[1]

    await tokenManager.verifyAccessToken(token)

    const payload = await tokenManager.decodePayload(token)
    req.user = payload

    next()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error)
    }

    return next(new AuthenticationError('Invalid access token'))
  }
}

export default authMiddleware