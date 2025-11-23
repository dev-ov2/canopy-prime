import { useEffect, useState } from 'react'
import { IS_DEV, isValidRequest, CORE_URL } from '../utils'
import { Logger } from '@/lib/utils'

const useInitialize = (type: string, iframeRef: React.RefObject<HTMLIFrameElement | null>) => {
  const [initialized, setInitialized] = useState<boolean>(false)
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const handleLoad = () => {
        setTimeout(() => {
          setIframeLoaded(true)
        }, 250)
      }
      iframe.addEventListener('load', handleLoad)
      return () => {
        iframe.removeEventListener('load', handleLoad)
      }
    }

    return () => {}
  }, [iframeRef])

  useEffect(() => {
    if (!initialized && iframeLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'FROM_CORE',
          data: { action: 'SYN', data: { data: { prime: true } } },
        },
        IS_DEV ? '*' : CORE_URL
      )
      Logger.info('useInitialize', 'FROM_CORE SYN dispatched, waiting for ACK...')
    }
  }, [iframeLoaded, iframeRef, initialized])

  useEffect(() => {
    const handleMessage = (event: any) => {
      if (isValidRequest(event)) {
        const requestType = event.data.type
        if (type === requestType) {
          Logger.info('useInitialize', `Received ${type} from core iframe, initialization complete.`)
          setInitialized(true)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [type])
}

export default useInitialize
