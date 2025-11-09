import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import appIcon from '@/resources/build/icon2.png?asset'
import { overwolf } from '@overwolf/ow-electron'
import { app, BrowserWindow, nativeImage, shell } from 'electron'
import __Store from 'electron-store' // https://github.com/sindresorhus/electron-store/issues/289#issuecomment-2899942966
import { join } from 'path'
import { StoreProps } from '../types'
import Core from './core'
import { ProcessSnapshot } from './process'
import { registerResourcesProtocol } from './protocols'
import { show } from './shared'

const owElectronApp = app as overwolf.OverwolfApp

export const Store = (__Store as any).default || __Store
const store: __Store<StoreProps> = new Store()

interface AppWindow extends BrowserWindow {
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
    icon: nativeImage.createFromDataURL(appIcon),
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
  registerAppHandlers(app, store)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    setTimeout(() => {
      if (store.get('firstRun', true)) {
        mainWindow.webContents?.send('on-first-run')
        owElectronApp.overwolf?.isCMPRequired().then((required: boolean) => {
          console.log('CMP required:', required)
          if (required) {
            owElectronApp.overwolf.openAdPrivacySettingsWindow()
          }
        })
        store.set('firstRun', false)
      }
    }, 500)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged) {
    if (process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else if (process.env['VITE_DEV_SERVER_URL']) {
      mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'] + 'app/index.html')
    }
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Monitor active process and notify core of successful intervals
  let activeProcess: ProcessSnapshot | null = null
  let count: any | null = null

  const onIntervalComplete = () => {
    if (mainWindow && activeProcess) {
      mainWindow.webContents.send('interval-complete', {
        appId: activeProcess.meta?.appId,
        source: activeProcess.meta?.source,
      })
    } else if (!activeProcess) {
      count = null
    }
  }

  const setActiveProcess = (process: ProcessSnapshot | null) => {
    show(mainWindow)
    activeProcess = process
    if (process && count === null) {
      count = Core.count(onIntervalComplete)
    } else if (!process && count !== null) {
      count()
      count = null
    }
  }

  const appWindow: AppWindow = Object.assign(mainWindow, { setActiveProcess })

  return appWindow
}
