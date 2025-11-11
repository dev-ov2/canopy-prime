import appIcon from '@/resources/assets/icon.png?asset'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { isElectronOverwolf } from '@overwolf/electron-is-overwolf'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { Logger } from '../utils'
import { createAppWindow } from './app'
import { GameRepository, SettingsRepository } from './db'
import { Steam } from './game-detection'
import Process from './process'

let isQuitting = false
let tray: Tray

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.canopy')
  // Create app window

  const hasSingleInstanceLock = app.requestSingleInstanceLock()
  if (!hasSingleInstanceLock) {
    app.quit()
  } else {
    const gameRepository = new GameRepository('games.db')
    const settingsRepository = new SettingsRepository('settings.db')

    const window = createAppWindow(settingsRepository)

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
      Logger.info('Second instance detected')
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
      Logger.info('AutoUpdater', 'Update downloaded and ready to install.')
      window?.webContents.send('update-downloaded')
    })

    const trayImage = app.isPackaged
      ? nativeImage.createFromPath(`${app.getAppPath()}/resources/assets/icon2.png`)
      : nativeImage.createFromDataURL(appIcon)

    tray = new Tray(trayImage)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          window?.show()
        },
      },
      {
        label: 'Scan for Games',
        click: () => {
          Steam.detect(gameRepository)
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
          createAppWindow(settingsRepository)
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
