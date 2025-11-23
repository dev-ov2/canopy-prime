export interface HotkeyConfig {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
}
export interface AppSettings {
  runAtStartup: boolean
  overlayAccelerator: string
  overlayDragAccelerator: string
  disableOverlay?: boolean
}

export interface StoreProps {
  firstRun: boolean
  appSettings: AppSettings
}
export interface IntervalResponse {
  state: 'started' | 'stopped'
  appId: string | null
  source: string | null
  name: string | null
}

export interface Statistic {
  label: string
  value: number | string
  helptext: string
}

export enum DataType {
  OVERLAY_STATISTICS = 'OVERLAY_STATISTICS',
  INTERVAL_COUNTER_UPDATE = 'INTERVAL_COUNTER_UPDATE',
}

export interface DataEnvelope {
  type: DataType
  data: any
}
