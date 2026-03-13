import createServer from './Infrastructures/http/createServer.js'

const PORT = process.env.PORT || 3000

const app = createServer()

app.listen(PORT, () => {
  console.warn(`Server berjalan di port ${PORT}`)
})