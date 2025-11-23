import { DataType } from '@/lib/types'
import { z } from 'zod'

export const appIpcSchema = {
  version: {
    args: z.tuple([]),
    return: z.string(),
  },
  'get-settings': {
    args: z.tuple([]),
    return: z.object({
      runAtStartup: z.boolean().optional(),
      overlayAccelerator: z.string().optional(),
      overlayDragAccelerator: z.string().optional(),
      disableOverlay: z.boolean().optional(),
    }),
  },
  'set-settings': {
    args: z.tuple([
      z
        .object({
          runAtStartup: z.boolean(),
          overlayAccelerator: z.string().optional(),
          overlayDragAccelerator: z.string().optional(),
          disableOverlay: z.boolean().optional(),
        })
        .partial(),
    ]),
    return: z.void(),
  },
  'open-external-link': {
    args: z.tuple([z.string().url()]),
    return: z.void(),
  },
  'open-privacy-settings': {
    args: z.tuple([]),
    return: z.void(),
  },
  'update-user-email-hash': {
    args: z.tuple([z.string()]),
    return: z.void(),
  },
  'restart-app': {
    args: z.tuple([]),
    return: z.void(),
  },
  'game-state-update': {
    args: z.tuple([]),
    handlerArgs: z.object({
      state: z.enum(['started', 'stopped']),
      appId: z.string().nullable(),
      source: z.string().nullable(),
      name: z.string().nullable(),
    }),
    return: z.void(),
  },
  'publish-overlay-payload': {
    args: z.tuple([
      z.object({
        type: z.enum(DataType),
        data: z.any(),
      }),
    ]),
    return: z.void(),
  },
  'on-first-run': {
    args: z.tuple([]),
    handlerArgs: z.tuple([]),
    return: z.void(),
  },
  'update-available': {
    args: z.tuple([]),
    handlerArgs: z.tuple([]),
    return: z.void(),
  },
  'update-downloaded': {
    args: z.tuple([]),
    handlerArgs: z.tuple([]),
    return: z.void(),
  },
  'token-received': {
    args: z.tuple([]),
    handlerArgs: z.string(),
    return: z.void(),
  },
  'toggle-drag-mode': {
    args: z.tuple([]),
    handlerArgs: z.string(),
    return: z.void(),
  },
}
