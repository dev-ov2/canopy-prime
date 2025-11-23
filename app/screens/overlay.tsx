import { DataEnvelope, DataType, IntervalResponse, Statistic } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import useBroadcastChannel from '../hooks/useBroadcastChannel'
import useGameState from '../hooks/useGameState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import CounterDisplay from '../components/ui/interval-counter'
import { SkellyStats, Statistic as Stat } from '../components/ui/statistic'
import useObsOverlaySocket from '../hooks/useObsOverlaySocket'
import useDragMode from '../hooks/useDragMode'

const Border = ({ image }: { image: string }) => {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-80"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'center',
        backgroundPosition: 'center',
        opacity: 0.8,
      }}
    />
  )
}

const formatElapsed = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const segments = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].filter(Boolean)
  return segments.join(':')
}

const Overlay = () => {
  const [gameInfo, setGameInfo] = useState<any>(null)
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [counter, setCounter] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const onMessage = useCallback((data: DataEnvelope) => {
    if (data.type === DataType.OVERLAY_STATISTICS) {
      const stats = data.data as Statistic[]
      setStatistics(stats)
    } else if (data.type === DataType.INTERVAL_COUNTER_UPDATE) {
      const intervalValue = data.data as number
      setCounter(intervalValue)
    }
  }, [])

  const onGameStateUpdate = useCallback((props: IntervalResponse) => {
    if (props.state === 'started') {
      setGameInfo(props)
      const startedAt = Date.now()
      setStartTime(startedAt)
      setElapsedMs(0)
    } else if (props.state === 'stopped') {
      setGameInfo(null)
      setStartTime(null)
      setElapsedMs(0)
      setCounter(null)
    }
  }, [])

  useBroadcastChannel({ channelName: 'overlay', onMessage })
  useGameState(onGameStateUpdate)
  useObsOverlaySocket({ onDataEnvelope: onMessage, onGameStateUpdate })

  useEffect(() => {
    if (!startTime) return
    const tick = () => setElapsedMs(Date.now() - startTime)
    tick()
    const intervalId = setInterval(tick, 1000)
    return () => clearInterval(intervalId)
  }, [startTime])

  const elapsedLabel = gameInfo && elapsedMs >= 0 ? formatElapsed(elapsedMs) : null

  const [dragging, dragAccelerator] = useDragMode()

  return (
    <div className="w-70 h-[520px] z-40 absolute top-0 left-(--sidebar-width-icon)">
      {dragging && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-yellow-300 bg-opacity-20 flex items-center justify-center flex-col cursor-move z-90"
          style={
            {
              '-webkit-app-region': 'drag',
            } as any
          }
        >
          <span className="text-yellow-900 font-semibold text-2xl">Drag Mode Enabled</span>
          <span className="text-yellow-900 text-lg">{dragAccelerator} to exit drag mode</span>
        </div>
      )}
      <Border image="https://res.cloudinary.com/dzsm7cl8v/image/upload/v1763586555/ornamental_tprwv1.svg" />
      <Card className="bg-black border-0 h-full">
        <CardHeader className="text-center">
          <CardTitle>{gameInfo?.name ?? 'No game running'}</CardTitle>
          <CardDescription>
            {gameInfo ? `Playing now · Time elapsed: ${elapsedLabel ?? '--:--'}` : 'sleeping - start a game to wake'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col left-0 right-0 mx-auto w-full items-center justify-center gap-2">
            <CounterDisplay label="Points earned" rounded={false} value={counter ?? '--'} />
            <div className="grid grid-cols-2 w-full h-full flex-col gap-4">
              {statistics.length > 0 ? (
                statistics.map((statistic, index) => (
                  <Stat key={index} label={statistic.label} value={statistic.value} helptext={statistic.helptext} />
                ))
              ) : (
                <SkellyStats />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Overlay
