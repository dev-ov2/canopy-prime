type TimerCancel = () => void

function count(onIntervalComplete: () => void): TimerCancel {
  let tick: ReturnType<typeof setTimeout> | undefined

  const scheduleNextTick = () => {
    const timeoutMs = Math.round(30 + Math.random() * 60) * 1_000

    tick = setTimeout(() => {
      onIntervalComplete()
      scheduleNextTick()
    }, timeoutMs)
  }

  scheduleNextTick()

  return () => {
    if (tick !== undefined) {
      clearTimeout(tick)
    }
  }
}

export default {
  count,
}
