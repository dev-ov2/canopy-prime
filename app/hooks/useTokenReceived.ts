import { useConveyor } from '@/app/hooks/use-conveyor'
import { useEffect } from 'react'

const useTokenReceived = (handler: (token: string) => void) => {
  const appApi = useConveyor('app')

  useEffect(() => {
    const off = appApi?.onTokenReceived(handler)
    return () => {
      off?.()
    }
  }, [appApi, handler])
}

export default useTokenReceived
