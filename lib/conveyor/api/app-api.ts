import { ConveyorApi } from '@/lib/preload/shared'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
  onIntervalComplete = (handler: () => void) => this.send('interval-complete', handler)
}
