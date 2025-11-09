import { electronApp, optimizer } from '@electron-toolkit/utils'
import { isElectronOverwolf } from '@overwolf/electron-is-overwolf'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { fileURLToPath } from 'url'
import { Logger } from '../utils'
import { createAppWindow } from './app'
import { GameRepository } from './db'
import { Steam } from './game-detection'
import Process from './process'
import appIcon from '@/resources/build/icon.png?asset'

let isQuitting = false
let tray: Tray

export const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const RENDERER_DIST = path.join(__dirname, '..', 'out', 'renderer')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Create app window

  const hasSingleInstanceLock = app.requestSingleInstanceLock()
  if (!hasSingleInstanceLock) {
    app.quit()
  } else {
    app.setLoginItemSettings({
      openAtLogin: true,
    })

    const window = createAppWindow()

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    window?.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault()
        window?.hide()
      }
    })

    app.on('second-instance', () => {
      if (app) {
        if (window) {
          if (window.isMinimized()) window.restore()
          window.show()
          window.focus()
        } else {
          Logger.warn('WARN: Main window is not defined on second-instance')
        }
      }
    })

    const gameRepository = new GameRepository('games.db')

    // Enable process monitoring
    Process.monitor(gameRepository, (game) => {
      window.setActiveProcess(game)
    })

    Steam.detect(gameRepository) // TODO add button to trigger manual scan

    autoUpdater.checkForUpdatesAndNotify() // TODO configure to GitHub

    autoUpdater.logger = log
    autoUpdater.on('update-available', () => {
      Logger.info('AutoUpdater', 'Update available.')
      window?.webContents.send('update-available')
    })

    autoUpdater.on('update-downloaded', () => {
      console.info('AutoUpdater', 'Update downloaded and ready to install.')
      window?.webContents.send('update-downloaded')
    })

    tray = new Tray(nativeImage.createFromDataURL(appIcon))

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          window?.show()
        },
      },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])

    tray.setContextMenu(contextMenu)
    tray.setToolTip('Canopy')

    tray.on('click', () => {
      if (window?.isVisible()) {
        window?.focus()
      } else {
        window?.show()
      }
    })

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    if (!isElectronOverwolf) {
      app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          createAppWindow()
        }
      })
    }
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
