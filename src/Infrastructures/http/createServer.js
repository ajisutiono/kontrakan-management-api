import express from 'express'

import container from '../container.js'
import createRouter from '../../Interfaces/http/api/index.js'
import ClientError from '../../Commons/exceptions/ClientError.js'

const createServer = () => {
  const app = express()

  app.use(express.json())
  app.use('/api', createRouter(container))

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if(error instanceof ClientError) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      })
    }

    console.error(error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  })

  return app
}

export default createServer