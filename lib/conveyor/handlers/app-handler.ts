import { type App } from 'electron'
import { handle } from '@/lib/main/shared'
import Store from 'electron-store'
import { shell } from 'electron'
import { StoreProps } from '@/lib/types'

export const registerAppHandlers = (app: App, store: Store<StoreProps>) => {
  // App operations
  handle('version', () => app.getVersion())
  handle('get-settings', () => {
    return store.get('appSettings')
  })
  handle('set-settings', (settings: any) => {
    store.set('appSettings', settings)
    app.setLoginItemSettings({
      openAtLogin: settings.runAtStartup,
    })
  })
  handle('open-external-link', (url: string) => {
    shell.openExternal(url)
  })

  handle('open-privacy-settings', () => {
    ;(app as any).overwolf?.openAdPrivacySettingsWindow()
  })
  handle('update-user-email-hash', (emailHash: string) => {
    if (emailHash.length > 0) {
      ;(app as any).overwolf.generateUserEmailHashes(emailHash)
    } else {
      ;(app as any).overwolf.setUserEmailHashes({})
    }
  })
  handle('restart-app', () => {
    app.relaunch()
    app.exit(0)
  })
}
