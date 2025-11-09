import { ConveyorApi } from '@/lib/preload/shared'
import { IntervalResponse } from '@/lib/types'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
  getSettings = () => this.invoke('get-settings')
  setSettings = (settings: any) => this.invoke('set-settings', settings)
  openExternalLink = (url: string) => this.invoke('open-external-link', url)
  openPrivacySettings = () => this.invoke('open-privacy-settings')
  updateUserEmailHash = (emailHash: string) => this.invoke('update-user-email-hash', emailHash)
  restartApp = () => this.invoke('restart-app')
  onIntervalComplete = (handler: (props: IntervalResponse) => void) => this.send('interval-complete', handler)
  onFirstRun = (handler: () => void) => this.send('on-first-run', handler)
  updateAvailable = (handler: () => void) => this.send('update-available', handler)
  updateDownloaded = (handler: () => void) => this.send('update-downloaded', handler)
}
