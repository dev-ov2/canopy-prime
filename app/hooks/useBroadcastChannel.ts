/**
 * Communications between different Electron Windows.
 * Opting for BroadcastChannel for speed and simplicity.
 */

import { useEffect, useRef } from 'react'

interface UseBroadcastChannelProps {
  channelName: string
  onMessage?: (data: any) => void
}

const useBroadcastChannel = ({
  channelName,
  onMessage,
}: UseBroadcastChannelProps): React.RefObject<BroadcastChannel | null> => {
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannelRef.current = new BroadcastChannel(channelName)
    } else {
      broadcastChannelRef.current = null
    }

    return () => {
      broadcastChannelRef.current?.close()
    }
  }, [channelName])

  useEffect(() => {
    if (!broadcastChannelRef.current || !onMessage) return

    const handleMessage = (event: MessageEvent) => {
      onMessage(event.data)
    }

    broadcastChannelRef.current.addEventListener('message', handleMessage)
    return () => {
      broadcastChannelRef.current?.removeEventListener('message', handleMessage)
    }
  }, [onMessage])
  return broadcastChannelRef
}

export default useBroadcastChannel
