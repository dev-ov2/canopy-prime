import { useConveyor } from '@/app/hooks/use-conveyor'
import { Logger } from '@/lib/utils'
import { useEffect } from 'react'
import { isValidRequest } from '../utils'

export enum RequestType {
  GAME_CONFIG_UPDATE = 'GAME_CONFIG_UPDATE_V2',
  CANOPY_STATE_UPDATE = 'CANOPY_STATE_UPDATE',
  USER_INFO = 'USER_INFO',
  DATA_RECEIVED = 'DATA_RECEIVED',
  OPEN_EXTERNAL_LINK = 'open-external',
  OPEN_HOME = 'open-home',
}

interface UseReceiverProps {
  gameId?: number | undefined
  onDataReceived?: (data: any) => void
  onOpenHome?: () => void
}

const useReceiver = ({ gameId, onDataReceived, onOpenHome }: UseReceiverProps) => {
  const app = useConveyor('app')
  useEffect(() => {
    const handleMessage = (event: any) => {
      if (isValidRequest(event)) {
        const requestType = event.data.type
        if (requestType === RequestType.OPEN_EXTERNAL_LINK) {
          app?.openExternalLink(event.data.url)
          return
        }

        if (requestType === RequestType.OPEN_HOME) {
          onOpenHome?.()
          return
        }

        if (requestType === RequestType.USER_INFO) {
          Logger.info('useReceiver', `Received user info for gameId: ${gameId}`)
          let { email } = event.data.data

          if (email?.length > 0) {
            const normalizedEmail = email.trim().toLowerCase()
            if (normalizedEmail.endsWith('@gmail.com')) {
              const atIndex = normalizedEmail.indexOf('@')
              let localPart = normalizedEmail.substring(0, atIndex)
              const domain = normalizedEmail.substring(atIndex)
              localPart = localPart.split('+')[0].replace(/\./g, '')
              email = localPart + domain
            }

            app?.updateUserEmailHash(email)
          } else {
            app?.updateUserEmailHash('')
          }
        } else if (requestType === RequestType.DATA_RECEIVED) {
          onDataReceived?.(event.data?.data)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [app, gameId, onDataReceived, onOpenHome])
}

export default useReceiver
