export interface HotkeyConfig {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  keyCode: number
}
export interface AppSettings {
  runAtStartup: boolean
  hotkeyConfig: HotkeyConfig
  useSmallOverlay: boolean
}

export interface StoreProps {
  firstRun: boolean
  appSettings: AppSettings
}
export interface IntervalResponse {
  appId: string
  source: string
}
