import { z } from 'zod'

export const appIpcSchema = {
  version: {
    args: z.tuple([]),
    return: z.string(),
  },
  'get-settings': {
    args: z.tuple([]),
    return: z.any(),
  },
  'set-settings': {
    args: z.tuple([z.object()]),
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
  'interval-complete': {
    args: z.tuple([]),
    handlerArgs: z.object({
      appId: z.string(),
      source: z.string(),
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
