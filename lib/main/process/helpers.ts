import { IntervalResponse } from '@/lib/types'
import { ProcessSnapshot } from './index'

export const buildIntervalResponse = (process: ProcessSnapshot | null): IntervalResponse => {
  if (!process) {
    return {
      state: 'stopped',
      appId: null,
      source: null,
      name: null,
    }
  } else {
    return {
      state: 'started',
      appId: process.meta?.appId?.toString?.() ?? null,
      source: process.meta?.source ?? null,
      name: process.meta?.name ?? process.name ?? null,
    }
  }
}
