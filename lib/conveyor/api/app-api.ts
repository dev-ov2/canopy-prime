import { ConveyorApi } from '@/lib/preload/shared'
import { AppSettings, DataEnvelope, IntervalResponse } from '@/lib/types'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
  getSettings = () => this.invoke('get-settings')
  setSettings = (settings: AppSettings) => this.invoke('set-settings', settings)
  openExternalLink = (url: string) => this.invoke('open-external-link', url)
  openPrivacySettings = () => this.invoke('open-privacy-settings')
  updateUserEmailHash = (emailHash: string) => this.invoke('update-user-email-hash', emailHash)
  restartApp = () => this.invoke('restart-app')
  onGameStateUpdate = (handler: (props: IntervalResponse) => void) => this.send('game-state-update', handler)
  onFirstRun = (handler: () => void) => this.send('on-first-run', handler)
  updateAvailable = (handler: () => void) => this.send('update-available', handler)
  updateDownloaded = (handler: () => void) => this.send('update-downloaded', handler)
  onTokenReceived = (handler: (token: string) => void) => this.send('token-received', handler)
  onToggleDragMode = (handler: (dragAccelerator: string) => void) => this.send('toggle-drag-mode', handler)
  publishOverlayPayload = (payload: DataEnvelope) => this.invoke('publish-overlay-payload', payload)
}
