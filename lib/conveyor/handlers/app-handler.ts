import { SettingsRepository } from '@/lib/main/db'
import { handle } from '@/lib/main/shared'
import { DataEnvelope } from '@/lib/types'
import { globalShortcut, shell, type App } from 'electron'

type AppHandlerCallbacks = {
  toggleOverlay?: () => void
  toggleOverlayDrag?: (accelerator: string) => void
  publishOverlayPayload?: (payload: DataEnvelope) => void
  handleDisableOverlay?: (disable: boolean) => void
}

export const registerAppHandlers = (
  app: App,
  settingsRepository: SettingsRepository,
  callbacks: AppHandlerCallbacks = {}
) => {
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
    callbacks.handleDisableOverlay?.(settings.disableOverlay)
    app.setLoginItemSettings({
      openAtLogin: settings.runAtStartup,
    })
    globalShortcut.unregisterAll()
    if (settings.overlayAccelerator && callbacks.toggleOverlay) {
      const callback = callbacks.toggleOverlay
      globalShortcut.register(settings.overlayAccelerator, callback)
    }
    if (settings.overlayDragAccelerator && callbacks.toggleOverlayDrag) {
      const callback = () => callbacks.toggleOverlayDrag!(settings.overlayDragAccelerator ?? 'ctrl+shift+D')
      globalShortcut.register(settings.overlayDragAccelerator, callback)
    }
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

  handle('publish-overlay-payload', (payload: DataEnvelope) => {
    callbacks.publishOverlayPayload?.(payload)
  })
}
