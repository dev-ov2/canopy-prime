import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { getImagePathViaFFI } from './ffi'

export const IGNORED_PROCESSES = new Set<string>([
  'epicwebhelper.exe',
  'epicgameslauncher.exe',
  'steam.exe',
  'gameoverlayui64.exe',
  'wallpaper64.exe',
  'steamservice.exe',
  'steamwebhelper.exe',
  'origin.exe',
  'eaanticheat.gameservicelauncher.exe',
  'bootstrappackagedgame',
])

export type ProcessListener = (proc: ProcessSnapshot) => void

const execFileAsync = promisify(execFile)

const command =
  "$ErrorActionPreference='Stop'; " +
  // include ParentProcessId so we can use parent-based heuristics
  'Get-CimInstance -ClassName Win32_Process | ' +
  'Where-Object { $_.SessionId -ne 0 } | ' +
  'Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine, SessionId, @{Name="FileDescription";Expression={if ($_.ExecutablePath) { (Get-Item $_.ExecutablePath).VersionInfo.FileDescription } else { $null }}} | ' +
  'ConvertTo-Json -Compress'

type RawProc = {
  ProcessId: number
  ParentProcessId?: number
  Name?: string
  ExecutablePath?: string
  CommandLine?: string
  SessionId?: number
  FileDescription?: string
}

type ProcessSnapshot = {
  pid: number
  name?: string
  cmd?: string
  path?: string
  sessionId?: number
  fileDescription?: string
  likelyGame: boolean
  score: number
  reasons: string[]
  meta?: {
    [key: string]: any
  }
}

export function getProcessSnapshot(p: RawProc): ProcessSnapshot {
  const pid = p.ProcessId
  const name = (p.Name || '').toLowerCase()
  const path = (p.ExecutablePath ? p.ExecutablePath : getImagePathViaFFI(pid) || '').toLowerCase()
  const cmd = (p.CommandLine || '').toLowerCase()
  const sessionId = p.SessionId
  const fileDescription = (p.FileDescription || '').toLowerCase()

  if (sessionId == 0 || IGNORED_PROCESSES.has(name) || IGNORED_PROCESSES.has(fileDescription)) {
    return {
      pid,
      name,
      cmd,
      path,
      sessionId,
      fileDescription,
      likelyGame: false,
      score: 0,
      reasons: ['process is in ignored list'],
    }
  }

  let score = 0
  const reasons: string[] = []

  const PATH_WEIGHT = 30
  const PARENT_WEIGHT = 40
  const ENGINE_WEIGHT = 30

  const launcherPathPatterns: RegExp[] = [
    /\\steamapps\\|\\steam\\|steamapps/i,
    /\\epic games\\|epic\s*games/i,
    /\\gog games\\|gog\s*games/i,
    /\\origin\\|\\ea games/i,
    /\\ubisoft\\|uplay/i,
    /\\battle.net\\|blizzard/i,
  ]

  const curiousPathPatterns: RegExp[] = [
    /\\xboxapps\\|windowsapps/i,
    /\\program files \(x86\)\\.*\\games/i,
    /\\games\b/i,
  ]
  if (path && launcherPathPatterns.some((r) => r.test(path))) {
    score += PATH_WEIGHT + PARENT_WEIGHT
    reasons.push('path matches known game/store folders')
    reasons.push('likely launched via game store client')
  } else if (path && curiousPathPatterns.some((r) => r.test(path))) {
    score += PATH_WEIGHT
    reasons.push('path matches common game-related folders')
  }

  const likelyLauncherNames = [
    /^steam(?:\.exe)?$/,
    /epicgameslauncher(?:\.exe)?$/,
    /origin(?:\.exe)?$/,
    /battle\.net(?:\.exe)?$/,
    /uplay(?:\.exe)?$/,
    /gog(?:\.exe)?$/,
  ]

  if (name && likelyLauncherNames.some((rx) => rx.test(name))) {
    score += PARENT_WEIGHT
    reasons.push('executable is a known game launcher/launcher-like process')
  } else if (cmd && likelyLauncherNames.some((rx) => rx.test(cmd))) {
    score += Math.floor(PARENT_WEIGHT / 2)
    reasons.push('command line contains known launcher name')
  }

  const engineIndicators = [
    /steam_api/i,
    /steamclient/i,
    /unityplayer/i,
    /ue4/i,
    /ue5/i,
    /unreal/i,
    /cryengine/i,
    /dxgi\.dll/i,
    /d3d9\.dll/i,
    /d3d11/i,
    /vulkan/i,
  ]
  if (engineIndicators.some((rx) => rx.test(path) || rx.test(cmd) || rx.test(name))) {
    score += ENGINE_WEIGHT
    reasons.push('found engine / game API indicators (Unity/Unreal/Steam/etc)')
  }

  if (/\b(game|client|launcher|server)\b/i.test(name)) {
    score += 10
    reasons.push('filename contains common game-related token')
  }

  score = Math.max(0, Math.min(100, score))

  const likelyGame = score >= 50

  return { pid, name, cmd, path, sessionId, fileDescription, likelyGame, score, reasons }
}

async function getDetectedGame(): Promise<ProcessSnapshot | null> {
  const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', command], {
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  })

  const trimmed = stdout.trim()
  if (!trimmed) return null

  const data = JSON.parse(trimmed)
  const items: RawProc[] = Array.isArray(data) ? data : [data]

  const foundProc = items
    .sort((a, b) => (a.ProcessId < b.ProcessId ? -1 : 1))
    .map(getProcessSnapshot)
    .filter((p) => p.likelyGame)

  return foundProc ? foundProc[0] : null
}

export function monitorGames(onGameDetected: ProcessListener, intervalMs = 15000): () => void {
  let trackedGame: ProcessSnapshot | null = null
  let timer: NodeJS.Timeout | undefined

  const poll = async () => {
    try {
      const game = await getDetectedGame()

      if (game && game?.pid !== trackedGame?.pid) {
        trackedGame = game
        onGameDetected(game)
      }
    } catch (error) {
      console.error('Failed to read process list', error)
    }
  }

  void poll()
  timer = setInterval(poll, intervalMs)

  return () => {
    if (timer) clearInterval(timer)
    timer = undefined
  }
}
