import { ComponentType, ReactNode, useEffect, useState } from 'react'
import { LuAppWindow, LuUser, LuX } from 'react-icons/lu'
import { useConveyor } from '@/app/hooks/use-conveyor'

const defaultHotkeyConfig = {
  ctrl: true,
  shift: true,
  alt: false,
  meta: false,
  keyCode: 'O'.charCodeAt(0),
}

type SettingsModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

type ContentProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

type TabButtonProps = {
  value: 'app' | 'privacy'
  label: string
  icon: ComponentType<{ className?: string }>
  isActive: boolean
  onSelect: (value: 'app' | 'privacy') => void
}

const Content = ({ title, subtitle, children }: ContentProps) => {
  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? <h4 className="text-sm font-semibold text-white/70">{subtitle}</h4> : null}
      </div>
      {children}
    </div>
  )
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
        checked ? 'bg-emerald-500' : 'bg-white/20'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

const TabButton = ({ value, label, icon: Icon, isActive, onSelect }: TabButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}

const SettingsModal = ({ open, setOpen }: SettingsModalProps) => {
  const app = useConveyor('app')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [runAtStartup, setRunAtStartup] = useState(true)
  const [useSmallOverlay, setUseSmallOverlay] = useState(false)
  const [hotkeyConfig, setHotkeyConfig] = useState(defaultHotkeyConfig)
  const [activeTab, setActiveTab] = useState<'app' | 'privacy'>('app')

  useEffect(() => {
    if (!open) {
      setActiveTab('app')
    }
  }, [open])

  useEffect(() => {
    app.getSettings().then((settings) => {
      if (Object.entries(settings).length > 0) {
        setRunAtStartup(settings.runAtStartup ?? true)
        setHotkeyConfig(settings.hotkeyConfig ?? defaultHotkeyConfig)
        setUseSmallOverlay(settings.useSmallOverlay ?? false)
      }
      setSettingsLoaded(true)
    })
  }, [app])

  useEffect(() => {
    if (!settingsLoaded) return

    app.setSettings({
      runAtStartup,
      hotkeyConfig,
      useSmallOverlay,
    })
  }, [runAtStartup, hotkeyConfig, useSmallOverlay, settingsLoaded, app])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-3xl bg-linear-to-b from-[#111111] to-[#222222] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
          >
            <div>
              <LuX />
            </div>
          </button>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav className="flex w-56 flex-col gap-2 border-r border-white/10 p-4">
            <TabButton
              value="app"
              label="App Settings"
              icon={LuAppWindow}
              isActive={activeTab === 'app'}
              onSelect={setActiveTab}
            />
            <TabButton
              value="privacy"
              label="Privacy Settings"
              icon={LuUser}
              isActive={activeTab === 'privacy'}
              onSelect={setActiveTab}
            />
          </nav>
          <section className="flex-1 overflow-y-auto p-6">
            {activeTab === 'app' ? (
              <Content title="App settings">
                <div className="flex w-full items-center justify-between gap-4">
                  <p className="text-sm text-white/80">Run Canopy at Windows startup</p>
                  <Toggle checked={runAtStartup} onChange={setRunAtStartup} />
                </div>
                <p className="self-end text-xs italic text-white/60">* Settings automatically update</p>
              </Content>
            ) : null}
            {activeTab === 'privacy' ? (
              <Content title="Privacy Settings">
                <div className="flex w-full items-center justify-between gap-4">
                  <p className="text-sm text-white/80">
                    Manage your privacy settings to control how your data is handled.
                  </p>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    onClick={() => {
                      app.openPrivacySettings()
                    }}
                  >
                    Manage
                  </button>
                </div>
              </Content>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
