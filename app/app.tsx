import { Desktop, Overlay } from './screens'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React.JSX {
    interface IntrinsicElements {
      owadview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const isObsMode = params.has('obs')

  return !isObsMode ? <Desktop /> : <Overlay />
}
