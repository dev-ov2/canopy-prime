import { useConveyor } from '@/app/hooks/use-conveyor'
import { useEffect } from 'react'

const useIntervalComplete = (handler: () => void) => {
  const appApi = useConveyor('app')

  useEffect(() => {
    const off = appApi.onIntervalComplete(handler)
    return () => {
      off()
    }
  }, [appApi, handler])
}

export default useIntervalComplete
