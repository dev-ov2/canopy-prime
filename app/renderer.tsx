import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WindowContextProvider titlebar={{ title: 'Canopy', icon: appIcon, menuItems, titleCentered: true }}>
        <App />
      </WindowContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
