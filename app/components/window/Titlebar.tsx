import { useEffect } from 'react'
import { useWindowContext } from './WindowContext'
import { useTitlebarContext } from './TitlebarContext'
import { TitlebarMenu } from './TitlebarMenu'
import { useConveyor } from '@/app/hooks/use-conveyor'

const SVG_PATHS = {
  close: 'M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z',
  maximize: 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z',
  minimize: 'M 0,5 10,5 10,6 0,6 Z',
} as const

export const Titlebar = () => {
  const { menuItems } = useWindowContext().titlebar
  const { menusVisible, setMenusVisible, closeActiveMenu } = useTitlebarContext()
  const { window: wcontext } = useWindowContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && menuItems?.length && !e.repeat) {
        if (menusVisible) closeActiveMenu()
        setMenusVisible(!menusVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menusVisible, closeActiveMenu, setMenusVisible, menuItems])

  return (
    <div className={`window-titlebar ${wcontext?.platform ? `platform-${wcontext.platform}` : ''}`}>
      <div className={'flex-1 w-72 self-center justify-center align-middle items-center'} />

      <div
        className="flex flex-col align-middle justify-between h-full w-[400px] z-60 pr-24 py-3"
        style={
          {
            '-webkit-app-region': 'drag',
          } as any
        }
      >
        <div className="mx-4 border h-0 border-gray-700/10" />
        <div className="mx-4 border h-0 border-gray-700/10" />
        <div className="mx-4 border h-0 border-gray-700/10" />
      </div>
      {menusVisible && <TitlebarMenu />}
      {wcontext?.platform === 'win32' && <TitlebarControls />}
    </div>
  )
}

const TitlebarControls = () => {
  const { window: wcontext } = useWindowContext()

  return (
    <div className="window-titlebar-controls pointer-events-auto">
      {wcontext?.minimizable && <TitlebarControlButton label="minimize" svgPath={SVG_PATHS.minimize} />}
      {wcontext?.maximizable && <TitlebarControlButton label="maximize" svgPath={SVG_PATHS.maximize} />}
      <TitlebarControlButton label="close" svgPath={SVG_PATHS.close} />
    </div>
  )
}

const TitlebarControlButton = ({ svgPath, label }: { svgPath: string; label: string }) => {
  const window = useConveyor('window')

  const handleAction = () => {
    const actions = {
      minimize: window?.windowMinimize,
      maximize: window?.windowMaximizeToggle,
      close: window?.windowClose,
    }
    actions[label as keyof typeof actions]?.()
  }

  return (
    <div aria-label={label} className="titlebar-controlButton" onClick={handleAction}>
      <svg width="10" height="10">
        <path fill="currentColor" d={svgPath} />
      </svg>
    </div>
  )
}

export interface TitlebarProps {
  title: string
  titleCentered?: boolean
  icon?: string
  menuItems?: TitlebarMenu[]
}
