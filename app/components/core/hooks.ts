import { useMemo } from 'react'
import { CORE_URL } from './utils'

export const useCoreUrl = (
  screen: string,
  gameId: number | undefined,
  gameTitle: string | undefined,
  route?: string,
  additionalParams?: Record<string, any>
) => {
  const url = useMemo(() => {
    const baseUrl = new URL(CORE_URL)

    const params = new URLSearchParams()
    if (gameId) params.set('game', gameId.toString())
    if (gameTitle) params.set('title', gameTitle)
    if (screen) params.set('screen', screen)
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value) params.set(key, value.toString())
      })
    }
    params.set('version', 'prime')

    // Set pathname to empty so only the hash route is used.
    baseUrl.pathname = ''
    // Place the route and parameters in the hash.
    const hashRoute = route || ''
    const hashQuery = params.toString()
    baseUrl.hash = hashRoute + (hashQuery ? '?' + hashQuery : '')

    return baseUrl.toString()
  }, [gameId, gameTitle, screen, additionalParams, route])

  return url
}
