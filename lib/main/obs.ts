import appIcon from '@/resources/assets/icon2.png'
import { app, BrowserWindow, nativeImage, shell } from 'electron'
import { join } from 'path'
import { SettingsRepository } from './db'
import { ProcessSnapshot } from './process'
import { buildIntervalResponse } from './process/helpers'
import { pin } from './shared'

interface AppWindow extends BrowserWindow {
  setActiveProcess: (process: ProcessSnapshot | null) => void
  activeProcess?: ProcessSnapshot | null
}

export function createObsWindow(settingsRepository: SettingsRepository): AppWindow {
  // Register custom protocol for resources
  // registerResourcesProtocol()

  // Create the main window.
  const obsWindow = new BrowserWindow({
    minWidth: 280,
    minHeight: 520,
    width: 280,
    height: 520,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: nativeImage.createFromDataURL(appIcon),
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Canopy OBS Overlay',
    skipTaskbar: true,
    maximizable: false,
    transparent: false,
    movable: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  obsWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged) {
    if (process.env['ELECTRON_RENDERER_URL']) {
      obsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?obs`)
    } else if (process.env['VITE_DEV_SERVER_URL']) {
      obsWindow.loadURL(process.env['VITE_DEV_SERVER_URL'] + 'app/index.html?obs')
    }
  } else {
    obsWindow.loadFile(join(__dirname, '../renderer/app/index.html'), {
      query: { obs: '1' },
    })
  }

  const setActiveProcess = (process: ProcessSnapshot | null) => {
    const payload = buildIntervalResponse(process)

    if (process) {
      if (settingsRepository.get('disableOverlay') === 'true') return
      pin(obsWindow)
    }

    Object.assign(obsWindow, { activeProcess: process })

    obsWindow.webContents.send('game-state-update', payload)
  }

  const appWindow: AppWindow = Object.assign(obsWindow, { setActiveProcess })

  return appWindow
}
