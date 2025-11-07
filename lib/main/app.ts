import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/icon.png?asset'
import { registerResourcesProtocol } from './protocols'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { ProcessSnapshot } from './process'
import Core from './core'

interface AppWindow {
  setActiveProcess: (process: ProcessSnapshot | null) => void
}

export function createAppWindow(): AppWindow {
  // Register custom protocol for resources
  registerResourcesProtocol()

  // Create the main window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Canopy',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  // Register IPC events for the main window.
  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Monitor active process and notify core of successful intervals
  let activeProcess: ProcessSnapshot | null = null
  let count: any | null = null

  const onIntervalComplete = () => {
    if (mainWindow && activeProcess) {
      mainWindow.webContents.send('interval-complete')
    } else if (!activeProcess) {
      count = null
    }
  }

  const setActiveProcess = (process: ProcessSnapshot | null) => {
    activeProcess = process
    if (process && count === null) {
      count = Core.count(onIntervalComplete)
    } else if (!process && count !== null) {
      count()
      count = null
    }
  }

  return {
    setActiveProcess,
  }
}
