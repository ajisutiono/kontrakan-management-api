import createServer from './Infrastructures/http/createServer.js'
import config from './Commons/config.js'
import container from './Infrastructures/container.js'

const app = createServer(container)

app.listen(config.server.port, config.server.host, () => {
  console.warn(`Server berjalan di ${config.server.host}:${config.server.port}`)
})