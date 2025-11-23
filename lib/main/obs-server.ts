import { OBS_OVERLAY_HTTP_PATH, OBS_OVERLAY_PORT, OBS_OVERLAY_SOCKET_PATH } from '@/lib/constants'
import { DataEnvelope, DataType, IntervalResponse, Statistic } from '@/lib/types'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { WebSocket, WebSocketServer } from 'ws'
import { Logger } from '../utils'

const MIME_TYPES: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.map': 'application/json',
  '.json': 'application/json',
  '.html': 'text/html',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
}

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
}

export type ObsOverlayServerOptions = {
  port?: number
  rendererRoot: string
  devServerUrl?: string | undefined
}

type ObsSocketMessage =
  | {
      type: 'init'
      payload: {
        gameState: IntervalResponse | null
        statistics: Statistic[]
        counter: number | null
      }
    }
  | {
      type: 'game-state-update'
      payload: IntervalResponse
    }
  | {
      type: 'overlay-data'
      payload: DataEnvelope
    }

export class ObsOverlayServer {
  private httpServer?: ReturnType<typeof createServer>
  private wsServer?: WebSocketServer
  private clients = new Set<WebSocket>()
  private port: number
  private latestGameState: IntervalResponse | null = null
  private latestStatistics: Statistic[] = []
  private latestCounter: number | null = null

  constructor(private readonly options: ObsOverlayServerOptions) {
    this.port = options.port ?? OBS_OVERLAY_PORT
  }

  start = async (): Promise<number> => {
    if (this.httpServer) {
      return this.port
    }

    const server = createServer(this.handleHttpRequest)
    const wsServer = new WebSocketServer({ server, path: OBS_OVERLAY_SOCKET_PATH })

    wsServer.on('connection', (socket) => {
      this.clients.add(socket)
      this.sendInitialState(socket)

      socket.on('close', () => {
        this.clients.delete(socket)
      })
    })

    await new Promise<void>((resolvePromise, rejectPromise) => {
      server.once('error', (error) => {
        Logger.error('OBS overlay server failed to start', error)
        rejectPromise(error)
      })
      server.listen(this.port, '127.0.0.1', () => {
        Logger.info('OBS overlay server listening on', `http://127.0.0.1:${this.port}${OBS_OVERLAY_HTTP_PATH}`)
        resolvePromise()
      })
    })

    this.httpServer = server
    this.wsServer = wsServer
    return this.port
  }

  stop = () => {
    this.wsServer?.clients.forEach((client) => client.close())
    this.wsServer?.close()
    this.httpServer?.close()
    this.clients.clear()
    this.wsServer = undefined
    this.httpServer = undefined
  }

  publishGameState = (payload: IntervalResponse) => {
    this.latestGameState = payload
    this.broadcast({ type: 'game-state-update', payload })
  }

  publishOverlayPayload = (payload: DataEnvelope) => {
    if (payload.type === DataType.OVERLAY_STATISTICS) {
      this.latestStatistics = Array.isArray(payload.data) ? payload.data : []
    }

    if (payload.type === DataType.INTERVAL_COUNTER_UPDATE) {
      this.latestCounter = typeof payload.data === 'number' ? payload.data : null
    }

    this.broadcast({ type: 'overlay-data', payload })
  }

  private sendInitialState = (socket: WebSocket) => {
    const snapshot: ObsSocketMessage = {
      type: 'init',
      payload: {
        gameState: this.latestGameState,
        statistics: this.latestStatistics,
        counter: this.latestCounter,
      },
    }

    socket.send(JSON.stringify(snapshot))
  }

  private broadcast = (message: ObsSocketMessage) => {
    const payload = JSON.stringify(message)
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    }
  }

  private handleHttpRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const pathname = url.pathname

    if (pathname === '/' || pathname === OBS_OVERLAY_HTTP_PATH) {
      return this.serveOverlay(res)
    }

    if (pathname.startsWith('/app/') || pathname.startsWith('/assets/')) {
      return this.serveStatic(pathname, res)
    }

    if (pathname === '/favicon.ico') {
      return this.serveFavicon(res)
    }

    res.writeHead(404, DEFAULT_HEADERS).end('Not Found')
  }

  private serveOverlay = (res: ServerResponse) => {
    if (this.options.devServerUrl) {
      const target = `${this.options.devServerUrl}app/index.html?obs`
      res.writeHead(302, { ...DEFAULT_HEADERS, Location: target }).end()
      return
    }

    res.writeHead(302, { ...DEFAULT_HEADERS, Location: '/app/index.html?obs' }).end()
  }

  private serveStatic = (pathname: string, res: ServerResponse) => {
    const staticPath = resolve(this.options.rendererRoot, `.${pathname}`)
    if (!staticPath.startsWith(resolve(this.options.rendererRoot))) {
      res.writeHead(403, DEFAULT_HEADERS).end('Forbidden')
      return
    }

    if (!existsSync(staticPath)) {
      res.writeHead(404, DEFAULT_HEADERS).end('Not Found')
      return
    }

    const mime = MIME_TYPES[extname(staticPath).toLowerCase()] ?? 'application/octet-stream'
    void this.streamFile(staticPath, mime, res)
  }

  private streamFile = async (filePath: string, mime: string, res: ServerResponse) => {
    try {
      const content = await readFile(filePath)
      res.writeHead(200, { ...DEFAULT_HEADERS, 'Content-Type': mime }).end(content)
    } catch (error) {
      Logger.error('Failed to serve overlay asset', error)
      res.writeHead(500, DEFAULT_HEADERS).end('Internal Server Error')
    }
  }

  private serveFavicon = (res: ServerResponse) => {
    res.writeHead(204, { ...DEFAULT_HEADERS, 'Content-Type': 'image/x-icon' }).end()
  }
}
