import { OBS_OVERLAY_PORT, OBS_OVERLAY_SOCKET_PATH } from '@/lib/constants'
import { DataEnvelope, DataType, IntervalResponse } from '@/lib/types'
import { useEffect, useState } from 'react'

const FALLBACK_SOCKET_URL = `ws://127.0.0.1:${OBS_OVERLAY_PORT}${OBS_OVERLAY_SOCKET_PATH}`

const resolveDefaultSocketUrl = () => {
  if (typeof window === 'undefined') return FALLBACK_SOCKET_URL

  const { protocol, hostname, port } = window.location
  const isLoopbackHost = !hostname || hostname === 'localhost' || hostname === '127.0.0.1'
  const targetHost = isLoopbackHost ? '127.0.0.1' : hostname
  const targetPort = isLoopbackHost ? OBS_OVERLAY_PORT.toString() : port || OBS_OVERLAY_PORT.toString()
  const scheme = protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${targetHost}:${targetPort}${OBS_OVERLAY_SOCKET_PATH}`
}

type UseObsOverlaySocketProps = {
  onDataEnvelope: (payload: DataEnvelope) => void
  onGameStateUpdate: (payload: IntervalResponse) => void
}

const useObsOverlaySocket = ({ onDataEnvelope, onGameStateUpdate }: UseObsOverlaySocketProps) => {
  const [usingSocket, setUsingSocket] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // if we have the conveyor, we're in the electron app and the socket is redundant; ignore
    if ((window as any).conveyor) return
    setUsingSocket(true)

    let socket: WebSocket | null = null
    let closed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    const socketUrl =
      (window as any).__CANOPY_OBS_SOCKET_URL__ ??
      (import.meta.env?.VITE_OBS_SOCKET_URL as string | undefined) ??
      resolveDefaultSocketUrl()

    const connect = () => {
      socket = new WebSocket(socketUrl)

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'game-state-update') {
            onGameStateUpdate(message.payload as IntervalResponse)
          } else if (message.type === 'overlay-data') {
            onDataEnvelope(message.payload as DataEnvelope)
          } else if (message.type === 'init') {
            const payload = message.payload as {
              gameState: IntervalResponse | null
              statistics: any
              counter: number | null
            }
            if (payload.gameState) {
              onGameStateUpdate(payload.gameState)
            }
            if (payload.statistics) {
              onDataEnvelope({ type: DataType.OVERLAY_STATISTICS, data: payload.statistics })
            }
            if (payload.counter !== null && payload.counter !== undefined) {
              onDataEnvelope({ type: DataType.INTERVAL_COUNTER_UPDATE, data: payload.counter })
            }
          }
        } catch (error) {
          console.error('Failed to parse OBS overlay socket payload', error)
        }
      }

      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 2000)
        }
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      socket?.close()
    }
  }, [onDataEnvelope, onGameStateUpdate])

  return usingSocket
}

export default useObsOverlaySocket
