import { useState, useEffect } from 'react'
import { DesktopFrame } from './components/core'
import { Titlebar } from './components/window/Titlebar'
import Landing from './landing'
import './styles/app.css'
import { useConveyor } from './hooks/use-conveyor'
import ChakraProvider from './components/ui/provider'
import useReceiver from './components/core/hooks/useReceiver'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React.JSX {
    interface IntrinsicElements {
      owadview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export default function App() {
  const app = useConveyor('app')
  const [open, setOpen] = useState<boolean>(false)
  const [hasUpdate, setHasUpdate] = useState<boolean>(false)
  useReceiver(undefined, () => setOpen(true))

  useEffect(() => {
    app.onFirstRun(() => {
      setOpen(true)
    })

    app.updateAvailable(() => {
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
      <ChakraProvider>
        <Landing open={open} setOpen={setOpen} hasUpdate={hasUpdate} />
      </ChakraProvider>
    </div>
  )
}
