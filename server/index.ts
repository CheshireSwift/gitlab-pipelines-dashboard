import { IncomingMessage, ServerResponse } from 'http'

const nodeStatic = require('node-static')
const http = require('http')
const socketIo = require('socket.io')

const file = new nodeStatic.Server('./dist')

const server = http.createServer(function (
  req: IncomingMessage,
  res: ServerResponse,
) {

  if (req.url && req.url.startsWith('/webhooks') && req.headers['x-gitlab-event'] === 'Pipeline Hook') {
    console.log('Pipeline change hook')

    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      res.end('OK', 'utf8')
      try {
        const { object_attributes, project }: PipelineEvent = JSON.parse(data)
        io.emit('pipeline' as SocketChannel, {
          object_attributes: {
            id: object_attributes.id,
            ref: object_attributes.ref,
            sha: object_attributes.sha,
            status: object_attributes.status,
            created_at: object_attributes.created_at,
            finished_at: object_attributes.finished_at,
          },
          project: {
            path_with_namespace: project.path_with_namespace,
            id: project.id,
          }
        } as PipelineEmission)
      } catch (e) {
        console.log('Error emitting hook event:', e.message)
      }
    })

    return
  }

  file.serve(req, res)
})

const io = socketIo(server)

io.on('connection', (socket: SocketIO.Socket) => {
  console.log('a user connected')
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})
