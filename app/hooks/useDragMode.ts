import { useConveyor } from '@/app/hooks/use-conveyor'
import { useState, useEffect } from 'react'

const useDragMode = () => {
  const [isDragMode, setIsDragMode] = useState(false)
  const [dragAccelerator, setDragAccelerator] = useState<string | null>(null)
  const appApi = useConveyor('app')

  useEffect(() => {
    const toggleDragMode = (accelerator: string) => {
      setIsDragMode((prev) => !prev)
      setDragAccelerator(accelerator)
    }
    const off = appApi?.onToggleDragMode(toggleDragMode)

    return () => {
      off?.()
    }
  }, [appApi, isDragMode])

  return [isDragMode, dragAccelerator]
}

export default useDragMode
