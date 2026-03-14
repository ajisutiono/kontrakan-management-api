import express from 'express'

import createRouter from '../../Interfaces/http/api/index.js'
import ClientError from '../../Commons/exceptions/ClientError.js'
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js'


const createServer = (container) => {
  const app = express()

  app.use(express.json())
  app.use('/api', createRouter(container))
  
  // if there is a route that is not registered
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'resource tidak ditemukan',
    })
  })

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    // domain error
    const translatedError = DomainErrorTranslator.translate(error)

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
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