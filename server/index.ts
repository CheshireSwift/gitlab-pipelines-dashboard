import { IncomingMessage, ServerResponse } from 'http'

const nodeStatic = require('node-static')
const http = require('http')
const socketIo = require('socket.io')

const file = new nodeStatic.Server('./dist')

const server = http.createServer(function(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (req.url && req.url.startsWith('/webhooks')) {
    io.emit('test', req.url)
    res.end('OK', 'utf8')
  }

  file.serve(req, res)
})

const io = socketIo(server)

io.on('connection', function(socket: SocketIO.Socket) {
  console.log('a user connected')
})

server.listen(3000, function() {
  console.log('listening on *:3000')
})
