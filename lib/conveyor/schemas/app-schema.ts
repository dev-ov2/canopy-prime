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
      hotkeyConfig: z
        .object({ ctrl: z.boolean(), shift: z.boolean(), alt: z.boolean(), meta: z.boolean(), keyCode: z.number() })
        .optional(),
      useSmallOverlay: z.boolean().optional(),
    }),
  },
  'set-settings': {
    args: z.tuple([
      z
        .object({
          runAtStartup: z.boolean(),
          hotkeyConfig: z
            .object({ ctrl: z.boolean(), shift: z.boolean(), alt: z.boolean(), meta: z.boolean(), keyCode: z.number() })
            .optional(),
          useSmallOverlay: z.boolean().optional(),
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
      appId: z.string(),
      source: z.string(),
      name: z.string(),
    }),
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
}
