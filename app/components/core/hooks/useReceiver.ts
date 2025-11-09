import { useEffect } from 'react'
import { isValidRequest } from '../utils'
import { useConveyor } from '@/app/hooks/use-conveyor'
import { Logger } from '@/lib/utils'

export enum RequestType {
  GAME_CONFIG_UPDATE = 'GAME_CONFIG_UPDATE_V2',
  CANOPY_STATE_UPDATE = 'CANOPY_STATE_UPDATE',
  USER_INFO = 'USER_INFO',
  OPEN_EXTERNAL_LINK = 'open-external',
  OPEN_HOME = 'open-home',
}

const useReceiver = (gameId: number | undefined, setOpenCb?: () => void) => {
  const app = useConveyor('app')
  useEffect(() => {
    const handleMessage = (event: any) => {
      if (isValidRequest(event)) {
        const requestType = event.data.type
        if (requestType === RequestType.OPEN_EXTERNAL_LINK) {
          app.openExternalLink(event.data.url)
          return
        }

        if (requestType === RequestType.OPEN_HOME) {
          setOpenCb?.()
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

            app.updateUserEmailHash(email)
          } else {
            app.updateUserEmailHash('')
          }
        } else {
          Logger.error('useReceiver', `Invalid request type: ${requestType}`)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [app, gameId, setOpenCb])
}

export default useReceiver
