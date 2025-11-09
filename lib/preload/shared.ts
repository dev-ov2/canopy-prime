import type { ChannelArgs, ChannelHandlerArgs, ChannelName, ChannelReturn } from '@/lib/conveyor/schemas'
import type { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload'
import { IpcRendererEvent } from 'electron'

export abstract class ConveyorApi {
  protected renderer: IpcRenderer

  constructor(electronApi: ElectronAPI) {
    this.renderer = electronApi.ipcRenderer
  }

  invoke = async <T extends ChannelName>(channel: T, ...args: ChannelArgs<T>): Promise<ChannelReturn<T>> => {
    // Call the IPC method without runtime validation in preload
    // Validation happens on the main process side
    return this.renderer.invoke(channel, ...args) as Promise<ChannelReturn<T>>
  }

  send = <T extends ChannelName>(channel: T, handler: (payload: ChannelHandlerArgs<T>) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, data: ChannelHandlerArgs<T>) => {
      handler(data)
    }
    const off = this.renderer.on(channel, listener)
    return off
  }
}
