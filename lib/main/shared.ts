import { screen, BrowserWindow, ipcMain } from 'electron'
import { ipcSchemas, validateArgs, validateReturn, type ChannelArgs, type ChannelReturn } from '@/lib/conveyor/schemas'

/**
 * Helper to register IPC handlers
 * @param channel - The IPC channel to register the handler for
 * @param handler - The handler function to register
 * @returns void
 */
export const handle = <T extends keyof typeof ipcSchemas>(
  channel: T,
  handler: (...args: ChannelArgs<T>) => ChannelReturn<T>
) => {
  ipcMain.handle(channel, async (_, ...args) => {
    try {
      const validatedArgs = validateArgs(channel, args)
      const result = await handler(...validatedArgs)

      return validateReturn(channel, result)
    } catch (error) {
      console.error(`IPC Error in ${channel}:`, error)
      throw error
    }
  })
}

export enum DisplayType {
  PRIMARY = 0,
  SECONDARY = 1,
}

export const show = (window: BrowserWindow | null, displayType: DisplayType = DisplayType.SECONDARY) => {
  const primaryDisplay = screen.getPrimaryDisplay()

  let targetDisplay
  switch (displayType) {
    case DisplayType.PRIMARY:
      targetDisplay = primaryDisplay
      break
    case DisplayType.SECONDARY:
      targetDisplay = screen.getAllDisplays().find((d) => d.id !== primaryDisplay.id) || primaryDisplay
      break
  }

  // Get the bounds of the target display
  const { x, y, width, height } = targetDisplay.bounds

  if (window) {
    const [windowWidth, windowHeight] = window.getSize()

    // Position window at the center of the target display
    const newX = x + Math.floor((width - windowWidth) / 2)
    const newY = y + Math.floor((height - windowHeight) / 2)

    window.setPosition(newX, newY)
    window.setAlwaysOnTop(true, 'screen-saver')
    window.show()

    setTimeout(() => {
      window.setAlwaysOnTop(false)
    }, 100)
  }
}
