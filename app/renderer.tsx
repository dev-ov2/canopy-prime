import { WindowContextProvider, menuItems } from '@/app/components/window'
import appIcon from '@/resources/assets/icon.png'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/app.css'

const params = new URLSearchParams(window.location.search)
const isObsMode = params.has('obs')

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isObsMode ? (
        <App />
      ) : (
        <WindowContextProvider titlebar={{ title: 'Canopy', icon: appIcon, menuItems, titleCentered: true }}>
          <App />
        </WindowContextProvider>
      )}
    </ErrorBoundary>
  </React.StrictMode>
)
