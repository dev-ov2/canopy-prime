import { useConveyor } from '@/app/hooks/use-conveyor'
import type { ChannelReturn } from '@/lib/conveyor/schemas'
import { createContext, useContext, useEffect, useState } from 'react'
import { TitlebarProps } from './Titlebar'
import { TitlebarContextProvider } from './TitlebarContext'

type WindowInitProps = ChannelReturn<'window-init'>

interface WindowContextProps {
  titlebar: TitlebarProps
  readonly window: WindowInitProps | undefined
}

const WindowContext = createContext<WindowContextProps | undefined>(undefined)

export const WindowContextProvider = ({
  children,
  titlebar = {
    title: 'Canopy',
    icon: 'appIcon.png',
    titleCentered: false,
    menuItems: [],
  },
}: {
  children: React.ReactNode
  titlebar?: TitlebarProps
}) => {
  const [initProps, setInitProps] = useState<WindowInitProps>()
  const window = useConveyor('window')

  useEffect(() => {
    window?.windowInit().then(setInitProps)

    // Add class to parent element
    const parent = document.querySelector('.window-content')?.parentElement
    parent?.classList.add('window-frame')
  }, [window, window?.windowInit])

  return (
    <WindowContext.Provider value={{ titlebar, window: initProps }}>
      <TitlebarContextProvider>
        <div className="window-content">{children}</div>
      </TitlebarContextProvider>
    </WindowContext.Provider>
  )
}

export const useWindowContext = () => {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error('useWindowContext must be used within a WindowContextProvider')
  }
  return context
}
