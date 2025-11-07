import { ConveyorApi } from '@/lib/preload/shared'
import { IntervalResponse } from '@/lib/types'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
  onIntervalComplete = (handler: (props: IntervalResponse) => void) => this.send('interval-complete', handler)
}
