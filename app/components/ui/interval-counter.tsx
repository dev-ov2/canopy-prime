'use client'

import { cn } from '@/lib/utils'

export default function CounterDisplay({
  value,

  label,

  rounded = true,
}: {
  value: number | string
  label?: string
  rounded?: boolean
}) {
  const hasValue = !isNaN(Number(value))

  return (
    <div className="w-[75%]">
      <div className={cn('overflow-hidden transition-all duration-500', rounded ? 'rounded-full' : 'rounded-lg')}>
        <div className="flex flex-col items-center justify-center">
          {/* Counter display */}
          <div className="relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-foreground/10 gap-2">
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  'absolute w-[90%] h-[90%] rounded-full bg-primary',
                  hasValue ? 'animate-ping-slow opacity-60' : 'animate-pulse-subtler'
                )}
              />
              <div className="absolute w-[70%] h-[70%] rounded-full opacity-25 bg-primary" />
              <div className="absolute w-[40%] h-[40%] rounded-full opacity-25 bg-primary" />
            </div>

            {/* Counter number */}
            <div className="relative z-10 flex flex-col items-center">
              <span
                className={cn(
                  'font-bold tracking-tight leading-none font-sans text-8xl',
                  hasValue ? 'animate-pulse-subtle' : ''
                )}
              >
                {value}
              </span>
              <span className={cn('uppercase tracking-wider mt-2 text-base')}>
                {label ? <>{label}</> : <>Points via Time played</>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
