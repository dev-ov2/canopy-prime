import { useEffect, useState } from 'react'

import {
  Button,
  Checkbox as ChCheckbox,
  CloseButton,
  Dialog,
  Heading,
  HStack,
  Input,
  Switch,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { LuAppWindow, LuUser } from 'react-icons/lu'
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
  children: React.ReactNode
}

const Tab = ({ value, children }: PropsWithChildren<{ value: string }>) => {
  return (
    <Tabs.Content value={value} w="100%">
      {children}
    </Tabs.Content>
  )
}

const Content = ({ title, subtitle, children }: ContentProps) => {
  return (
    <VStack gap={4} align="start">
      <Heading size="sm" fontWeight="bold">
        {title}
      </Heading>
      {subtitle && (
        <Heading size="xs" fontWeight="semibold">
          {subtitle}
        </Heading>
      )}
      {children}
    </VStack>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange?: (checked: boolean) => void
}

const Checkbox = ({ checked, label, onChange }: CheckboxProps) => {
  return (
    <ChCheckbox.Root checked={checked} onCheckedChange={(e) => onChange?.(!!e.checked)}>
      <ChCheckbox.HiddenInput />
      <ChCheckbox.Control />
      <ChCheckbox.Label>{label}</ChCheckbox.Label>
    </ChCheckbox.Root>
  )
}

const KeySelector = ({ defaultValue, onChange }: { defaultValue: string; onChange?: (keyCode: number) => void }) => {
  return (
    <Input
      defaultValue={defaultValue}
      type="text"
      placeholder="Press a key..."
      maxLength={1}
      minLength={1}
      variant="outline"
      size="sm"
      flex={1}
      onChange={(e) => {
        const key = e.target.value
        if (key.length === 1) {
          const keyCode = key.toUpperCase().charCodeAt(0)
          onChange?.(keyCode)
        }
      }}
    />
  )
}

const SettingsModal = ({ open, setOpen }: SettingsModalProps) => {
  const app = useConveyor('app')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [runAtStartup, setRunAtStartup] = useState(true)
  const [useSmallOverlay, setUseSmallOverlay] = useState(false)
  const [hotkeyConfig, setHotkeyConfig] = useState(defaultHotkeyConfig)

  useEffect(() => {
    app.getSettings().then((settings) => {
      if (settings) {
        setRunAtStartup(settings.runAtStartup)
        setHotkeyConfig(settings.hotkeyConfig ?? defaultHotkeyConfig)
        setUseSmallOverlay(settings.useSmallOverlay)
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

  return (
    <Dialog.Root lazyMount open={open} size="xl" onOpenChange={(e: any) => setOpen(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Heading size="md">Settings</Heading>
          </Dialog.Header>
          <Dialog.Body>
            <Tabs.Root defaultValue="app" orientation="vertical">
              <Tabs.List w={200}>
                <Tabs.Trigger value="app">
                  <LuAppWindow />
                  App Settings
                </Tabs.Trigger>
                <Tabs.Trigger value="privacy">
                  <LuUser />
                  Privacy Settings
                </Tabs.Trigger>
              </Tabs.List>
              <Tab value="privacy">
                <Content title="Privacy Settings">
                  <HStack w="100%" justifyContent={'space-between'}>
                    <Text fontSize="md">Manage your privacy settings to control how your data is handled.</Text>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => {
                        app.openPrivacySettings()
                      }}
                    >
                      Manage
                    </Button>
                  </HStack>
                </Content>
              </Tab>
              <Tab value="app">
                <Content title="App settings" subtitle="">
                  <HStack w="100%" justifyContent={'space-between'}>
                    <Text fontSize="md">Run Canopy at Windows startup</Text>
                    <Switch.Root checked={runAtStartup} onCheckedChange={(e) => setRunAtStartup(e.checked)}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                    </Switch.Root>
                  </HStack>
                  <Text fontStyle="italic" alignSelf="end">
                    * Settings automatically update
                  </Text>
                </Content>
              </Tab>
            </Tabs.Root>
          </Dialog.Body>
          <Dialog.Footer></Dialog.Footer>
          <Dialog.CloseTrigger>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default SettingsModal
