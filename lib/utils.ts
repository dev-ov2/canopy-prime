import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function indexOfNth(str: string, pat: string, n: number): number {
  const L = str.length
  let i = -1
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i)
    if (i < 0) break
  }
  return i
}

export interface LoggerInterface {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

let internalLogger = {
  info: (...args: any[]) => {
    console.log(...args)
  },
  warn: (...args: any[]) => {
    console.warn(...args)
  },
  error: (...args: any[]) => {
    console.error(...args)
  },
}

export const Logger: LoggerInterface & {
  setLogger: (Logger: LoggerInterface) => void
} = {
  info: (...args: any[]) => internalLogger.info(...args),
  warn: (...args: any[]) => internalLogger.warn(...args),
  error: (...args: any[]) => internalLogger.error(...args),
  setLogger: (newLogger: LoggerInterface) => (internalLogger = newLogger),
}
