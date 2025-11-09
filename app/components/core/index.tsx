import { DetailedHTMLProps, IframeHTMLAttributes, useCallback, useRef } from 'react'
import { useCoreUrl } from './hooks'
import useInitialize from './hooks/useInitialize'
import useIntervalComplete from './hooks/useIntervalComplete'
import { CORE_URL, PRIME_UID } from './utils'
import { IntervalResponse } from '@/lib/types'

interface ScreenSize {
  width: number
  height: number
  scale: number
}

interface CoreProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  gameId?: number | undefined
  gameTitle?: string | undefined
  screen: string
  subscribed?: boolean
  screenSize?: ScreenSize
}

export function Frame({
  gameId = -Infinity,
  gameTitle = '',
  screen = 'unknown',
  iframeRef,
  onLoad,
  ...props
}: DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> & CoreProps) {
  const src = useCoreUrl(screen, gameId, gameTitle, `/_m/${PRIME_UID}`)

  return (
    <iframe
      allowTransparency={true}
      src={src}
      width={0}
      height={0}
      title="canopy-portal"
      ref={iframeRef}
      onLoad={onLoad}
      {...props}
    />
  )
}

export function DesktopFrame({
  gameId = -Infinity,
  gameTitle = '',
  screen = 'desktop',
  subscribed = false,
  hasUpdate = false,
  ...props
}: DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> &
  Omit<CoreProps, 'iframeRef'> & { hasUpdate: boolean }) {
  const src = useCoreUrl(screen, gameId, gameTitle, '', { hasUpdate })
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const dispatchIntervalComplete = useCallback(
    (props: IntervalResponse) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'FROM_CORE',
            data: { action: 'INTERVAL_COMPLETE', data: { data: props } },
          },
          CORE_URL
        )
      }
    },
    [iframeRef]
  )

  useInitialize('ACK', iframeRef, gameId, 'desktop')

  useIntervalComplete(dispatchIntervalComplete)

  return (
    <Frame
      iframeRef={iframeRef}
      loading={'lazy'}
      {...props}
      gameId={gameId}
      gameTitle={gameTitle}
      screen={screen}
      style={
        subscribed
          ? {
              position: 'fixed',
              top: '30px',
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 30px)',
              border: 'none',
              margin: 0,
              padding: 0,
              overflow: 'hidden',
              zIndex: 4,
            }
          : {
              width: '100%',
              height: '100%',
              border: 'none',
              overflow: 'hidden',
              zIndex: 4,
            }
      }
      allowFullScreen={false}
      src={src}
      className="window-content"
    />
  )
}
