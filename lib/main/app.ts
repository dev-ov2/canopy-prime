import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import appIcon from '@/resources/assets/icon2.png'
import { overwolf } from '@overwolf/ow-electron'
import { app, BrowserWindow, nativeImage, shell } from 'electron'
import { join } from 'path'
import { Logger } from '../utils'
import { SettingsRepository } from './db'
import { ProcessSnapshot } from './process'
import { registerResourcesProtocol } from './protocols'
import { show } from './shared'

const owElectronApp = app as overwolf.OverwolfApp

interface AppWindow extends BrowserWindow {
  setActiveProcess: (process: ProcessSnapshot | null) => void
}

export function createAppWindow(settingsRepository: SettingsRepository): AppWindow {
  // Register custom protocol for resources
  registerResourcesProtocol()

  // Create the main window.
  const mainWindow = new BrowserWindow({
    minWidth: 1160,
    minHeight: 645,
    width: 1160,
    height: 645,
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
  registerAppHandlers(app, settingsRepository)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    setTimeout(() => {
      if (settingsRepository.get('firstRun', 'true') === 'true') {
        app.setLoginItemSettings({
          openAtLogin: true,
        })
        mainWindow.webContents?.send('on-first-run')
        owElectronApp.overwolf?.isCMPRequired().then((required: boolean) => {
          Logger.info('CMP required:', required)
          if (required) {
            owElectronApp.overwolf.openAdPrivacySettingsWindow()
          }
        })
        settingsRepository.upsert('firstRun', 'false')
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
    mainWindow.loadFile(join(__dirname, '../renderer/app/index.html'))
  }

  const setActiveProcess = (process: ProcessSnapshot | null) => {
    if (process) {
      show(mainWindow)
      mainWindow.webContents.send('game-state-update', {
        state: 'started',
        appId: process.meta?.appId,
        source: process.meta?.source,
        name: process.meta?.name,
      })
    } else if (!process) {
      mainWindow.webContents.send('game-state-update', {
        state: 'stopped',
        appId: null,
        source: null,
        name: null,
      })
    }
  }

  const appWindow: AppWindow = Object.assign(mainWindow, { setActiveProcess })

  return appWindow
}
