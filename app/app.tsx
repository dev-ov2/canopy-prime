import { DesktopFrame } from './components/core'
import { Titlebar } from './components/window/Titlebar'
import './styles/app.css'

export default function App() {
  return (
    <div className="relative">
      <Titlebar />
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <DesktopFrame screen="desktop" hasUpdate={false} />
      </div>
    </div>
  )
}
