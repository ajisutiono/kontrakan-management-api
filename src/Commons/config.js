/* istanbul ignore file */
import path from 'path'

import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.test.env'),
  })
} else {
  dotenv.config()
}

const requiredEnvVars = [
  'PGHOST',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'HOST',
  'PORT',
]

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const config = {
  server: {
    host: process.env.HOST,
    port: Number(process.env.PORT),
  },
  database: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
}

export default config