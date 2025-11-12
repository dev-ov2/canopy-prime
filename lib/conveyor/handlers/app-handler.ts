import { SettingsRepository } from '@/lib/main/db'
import { handle } from '@/lib/main/shared'
import { shell, type App } from 'electron'

export const registerAppHandlers = (app: App, settingsRepository: SettingsRepository) => {
  // App operations
  handle('version', () => app.getVersion())
  handle('get-settings', () => {
    const json = settingsRepository.get('appSettings') || '{}'
    return JSON.parse(json)
  })
  handle('set-settings', (settings: any) => {
    if (Object.entries(settings).length > 0) {
      settingsRepository.upsert('appSettings', JSON.stringify(settings))
    }
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
