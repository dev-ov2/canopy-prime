import { useConveyor } from '@/app/hooks/use-conveyor'
import { IntervalResponse } from '@/lib/types'
import { useEffect } from 'react'

const useGameState = (handler: (props: IntervalResponse) => void) => {
  const appApi = useConveyor('app')

  useEffect(() => {
    const off = appApi?.onGameStateUpdate(handler)
    return () => {
      off?.()
    }
  }, [appApi, handler])
}

export default useGameState
