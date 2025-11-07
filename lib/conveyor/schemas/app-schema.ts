import { z } from 'zod'

export const appIpcSchema = {
  version: {
    args: z.tuple([]),
    return: z.string(),
  },
  'interval-complete': {
    args: z.tuple([]),
    return: z.void(),
  },
}
