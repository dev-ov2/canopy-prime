import { DesktopFrame } from './components/core'
import { Titlebar } from './components/window/Titlebar'
import './styles/app.css'

export default function App() {
  return (
    <div className="relative">
      <Titlebar />
      <div className="absolute flex top-0 bottom-0 left-0 right-0">
        <div className="flex-2">
          <div className="flex h-full flex-col">
            <div className="flex-1 border border-[#27272a] rounded">
              <DesktopFrame screen="desktop" hasUpdate={false} />
            </div>
            <div className="flex flex-0 min-h-[60px] items-center justify-center">
              <p>ad</p>
            </div>
          </div>
        </div>
        <div className="mt-[var(--window-titlebar-height)] flex flex-0 min-w-[300px] items-center justify-center">
          <p>ad</p>
        </div>
      </div>
    </div>
  )
}
