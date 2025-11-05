import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import { createAppWindow } from './app'
import { detectGames } from './game-detection/steam'
import { monitorGames } from './process'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Create app window
  createAppWindow()

  // Enable process monitoring
  monitorGames((game) => {
    console.log('Detected game process:', game)
    // TODO pass this off to Canopy core for further handling
  })

  detectGames()
    .then((games) => {
      for (const [gameId, gameInfo] of Object.entries(games)) {
        const { installPath, name } = gameInfo
        console.log(`Detected Steam game - AppID: ${gameId}, Name: ${name}, Install Path: ${installPath}`)
        // TODO do something with the detected games, like save them to a local database
      }
    })
    .catch((error) => {
      console.error('Failed to detect games:', error)
    })
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createAppWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
