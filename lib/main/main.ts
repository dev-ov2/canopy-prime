import appIcon from '@/resources/assets/icon.png?asset'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { isElectronOverwolf } from '@overwolf/electron-is-overwolf'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { registerAppHandlers } from '../conveyor/handlers/app-handler'
import { registerWindowHandlers } from '../conveyor/handlers/window-handler'
import { Logger } from '../utils'
import { createAppWindow } from './app'
import { GameRepository, SettingsRepository } from './db'
import { Steam } from './game-detection'
import { createObsWindow } from './obs'
import { ObsOverlayServer } from './obs-server'
import Process from './process'
import { buildIntervalResponse } from './process/helpers'
import { join } from 'path'

let isQuitting = false
let tray: Tray

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.canopy')
  app.setAsDefaultProtocolClient('canopy')

  const hasSingleInstanceLock = app.requestSingleInstanceLock()
  if (!hasSingleInstanceLock) {
    app.quit()
  } else {
    const gameRepository = new GameRepository('games.db')
    const settingsRepository = new SettingsRepository('settings.db')

    const window = createAppWindow(settingsRepository)
    const obs = createObsWindow(settingsRepository)

    const rendererRoot = join(__dirname, '../renderer')
    const devServerUrl = !app.isPackaged
      ? (process.env['VITE_DEV_SERVER_URL'] ?? process.env['ELECTRON_RENDERER_URL'])
      : undefined
    const obsOverlayServer = new ObsOverlayServer({ rendererRoot, devServerUrl })

    void obsOverlayServer.start().catch((error) => {
      Logger.error('Failed to start OBS overlay server', error)
    })

    // Register IPC events for the main window.
    registerWindowHandlers(window)
    registerAppHandlers(app, settingsRepository, {
      toggleOverlay: () => {
        if (obs.isVisible()) {
          obs.hide()
        } else {
          obs.show()
        }
      },
      toggleOverlayDrag: (accelerator: string) => {
        if (!obs.isVisible()) {
          obs.show()
        }
        obs.focus()
        obs.setMovable(!obs.isMovable())
        obs.setIgnoreMouseEvents(!obs.isMovable())

        obs.webContents.send('toggle-drag-mode', accelerator)
      },
      publishOverlayPayload: (payload) => {
        obsOverlayServer.publishOverlayPayload(payload)
      },
      handleDisableOverlay: (disable: boolean) => {
        if (disable) {
          if (obs.isVisible()) {
            obs.hide()
          }
        }

        if (!disable) {
          if (obs.activeProcess && !obs.isVisible()) {
            obs.show()
          }
        }
      },
    })

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

    app.on('second-instance', async (_event: Electron.Event, argv: string[]) => {
      Logger.info('Second instance detected')
      if (app) {
        if (window) {
          if (window.isMinimized()) window.restore()
          window.show()
          window.focus()
          const urlArg = argv.find((a) => a.startsWith('canopy://'))

          if (urlArg) {
            const url = new URL(urlArg)
            Logger.info('Received URL arg on second-instance')
            if (url.hash.includes('id_token=')) {
              Logger.info('URL arg is token request. Exchanging token...')
              try {
                const res = await fetch('https://us-central1-canopy-yponac.cloudfunctions.net/exchangeFirebaseToken', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ token: new URL(urlArg).hash.split('id_token=')[1] }),
                })
                const json = await res.json()
                window.webContents.send('token-received', json.customToken)
              } catch (e) {
                Logger.error('Error exchanging token:', e)
              }
            }
          }
        } else {
          Logger.warn('WARN: Main window is not defined on second-instance')
        }
      }
    })

    // Enable process monitoring
    Process.monitor(gameRepository, (game) => {
      window.setActiveProcess(game)
      obs.setActiveProcess(game)
      const intervalPayload = buildIntervalResponse(game)
      obsOverlayServer.publishGameState(intervalPayload)
    })

    Steam.detect(gameRepository)

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

    app.on('before-quit', () => {
      obsOverlayServer.stop()
    })
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
