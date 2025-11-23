import { DataEnvelope, DataType } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { DesktopFrame } from '../components/core'
import useBroadcastChannel from '../hooks/useBroadcastChannel'
import useReceiver from '../components/core/hooks/useReceiver'
import { Titlebar } from '../components/window/Titlebar'
import { useConveyor } from '../hooks/use-conveyor'
import Landing from '../landing'

const Desktop = () => {
  const app = useConveyor('app')

  const [open, setOpen] = useState<boolean>(false)
  const [hasUpdate, setHasUpdate] = useState<boolean>(false)

  const overlayChannel = useBroadcastChannel({ channelName: 'overlay' })

  const onDataReceived = useCallback(
    (data: DataEnvelope) => {
      if (overlayChannel && [DataType.OVERLAY_STATISTICS, DataType.INTERVAL_COUNTER_UPDATE].includes(data.type)) {
        overlayChannel.current?.postMessage(data)
      }

      app?.publishOverlayPayload(data).catch((error) => console.error('Failed to publish overlay payload', error))
    },
    [app, overlayChannel]
  )

  const onOpenHome = () => {
    setOpen(true)
  }

  useReceiver({ onOpenHome, onDataReceived })

  useEffect(() => {
    app?.onFirstRun(() => {
      setOpen(true)
    })

    app?.updateAvailable(() => {
      setHasUpdate(true)
    })
  }, [app, setHasUpdate])

  return (
    <div className="relative">
      <Titlebar />
      <div className="absolute flex top-0 bottom-0 left-0 right-0 overflow-clip">
        <div className="flex-2">
          <div className="flex h-full flex-col">
            <div className="flex-1 border border-[#27272a] rounded">
              <DesktopFrame screen="desktop" hasUpdate={false} />
            </div>
            <div className="flex flex-0 h-[90px] items-center justify-center">
              {open ? (
                <></>
              ) : (
                <div className="w-[728px] h-[90px] bg-transparent">
                  <owadview />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-(--window-titlebar-height) flex flex-0 w-[400px] items-center justify-center">
          {open ? (
            <></>
          ) : (
            <div className="w-[400px] h-[600px] bg-transparent">
              <owadview />
            </div>
          )}
        </div>
      </div>
      <Landing open={open} setOpen={setOpen} hasUpdate={hasUpdate} />
    </div>
  )
}

export default Desktop
