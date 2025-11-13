import fs from 'fs'
import path from 'path'

import { Logger } from '@/lib/utils'
import { parse as parseVdf } from '@node-steam/vdf'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { GameRepository } from '../db'
import { Source } from './shared'

const execFileAsync = promisify(execFile)

export async function findSteamExecutable(): Promise<string | null> {
  const command =
    "$ErrorActionPreference='Stop'; " +
    'Get-CimInstance -ClassName Win32_Process | ' +
    'Where-Object { $_.Name -and ($_.Name -ieq "steam.exe") -and $_.SessionId -ne 0 } | ' +
    'Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine, SessionId, @{Name="FileDescription";Expression={if ($_.ExecutablePath) { (Get-Item $_.ExecutablePath).VersionInfo.FileDescription } else { $null }}} | ' +
    'ConvertTo-Json -Compress'

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', command])

    try {
      const json = JSON.parse(stdout)
      const path = json?.ExecutablePath ?? json?.Path ?? ''
      return path.length > 0 ? path : null
    } catch (e) {
      if (stdout.length === 0) throw new Error('no Steam process is running')

      throw e
    }
  } catch (error: any) {
    Logger.error('Error finding Steam executable:', error.message)
    return null
  }
}

function normalizeLibraryPath(p: string): string {
  // Some VDFs store escaped backslashes; fix them.
  const fixed = p.replace(/\\\\/g, '\\')
  return path.resolve(fixed)
}

export async function getSteamLibraries(): Promise<string[]> {
  const exePath = await findSteamExecutable()
  if (exePath) {
    const steamPath = exePath.replace(/\\/g, '/').replace(/\/steam\.exe$/i, '')
    const libraryPath = `${steamPath}/steamapps/libraryfolders.vdf`
    if (fs.existsSync(libraryPath)) {
      try {
        const text = fs.readFileSync(libraryPath, 'utf8')
        const parsed = parseVdf(text)

        const root = parsed.LibraryFolders || parsed.libraryfolders || parsed

        const libs: string[] = []
        for (const key of Object.keys(root)) {
          const entry = root[key]
          if (typeof entry === 'object' && entry.path) {
            libs.push(normalizeLibraryPath(entry.path))
          } else if (typeof entry === 'string') {
            libs.push(normalizeLibraryPath(entry))
          }
        }
        return libs
      } catch (error) {
        Logger.error('Error reading libraryfolders.vdf:', error)
        return []
      }
    }
  }
  throw new Error('err_no_steam.exe')
}

interface GameInfo {
  appId: number
  installPath: string
  name: string
}

export async function detectGames(gameRepository: GameRepository) {
  try {
    Logger.info('[Steam] detectGames invoked. Scanning for Steam games...')
    const libraries = await getSteamLibraries()
    const games: Record<number, GameInfo> = {}

    for (const library of libraries) {
      const files = fs.readdirSync(path.join(library, 'steamapps'))
      for (const file of files) {
        if (file.endsWith('.acf')) {
          const gameId = parseInt(file.split('_')[1])
          if (!Number.isNaN(gameId)) {
            const manifestPath = path.join(library, 'steamapps', file)
            try {
              const manifest = parseVdf(fs.readFileSync(manifestPath, 'utf8'))
              const appState = manifest.AppState ?? manifest.appstate ?? manifest
              const installDir = (appState?.installdir ?? appState?.InstallDir)?.trim()
              if (installDir) {
                games[gameId] = {
                  appId: gameId,
                  installPath: path.join('steamapps', 'common', installDir),
                  name: (appState?.name ?? appState?.Name ?? '').trim(),
                }
                gameRepository.upsert({
                  appId: gameId,
                  path: path.join('steamapps', 'common', installDir).toLowerCase(),
                  name: (appState?.name ?? appState?.Name ?? '').trim(),
                  source: Source.Steam,
                  executable: null, // we do not have the executable yet. We will fill this in later.
                })
              }
            } catch (error) {
              Logger.error('Failed to read manifest:', manifestPath, error)
            }
          }
        }
      }
    }
    Logger.info(`Detected ${Object.keys(games).length} Steam games in ${libraries.length} libraries.`)
  } catch (e) {
    if (e instanceof Error && e.message === 'err_no_steam.exe') {
      Logger.warn('Steam executable not found. Retrying in 30 seconds...')
      setTimeout(() => detectGames(gameRepository), 30000)
    }
  }
}
