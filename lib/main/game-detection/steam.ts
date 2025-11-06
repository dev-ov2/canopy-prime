import fs from 'fs'
import path from 'path'

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import * as vdf from 'vdf'
import { GameRepository } from '../db'
import { Source } from './shared'

const execFileAsync = promisify(execFile)

export async function findSteamExecutable(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-Command -Name steam.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source',
    ])

    const path = stdout.trim()
    return path.length > 0 ? path : null
  } catch (error) {
    console.error('Error finding Steam executable:', error)
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
        const parsed = vdf.parse(text)

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
        console.error('Error reading libraryfolders.vdf:', error)
        return []
      }
    }
  }
  return []
}

interface GameInfo {
  appId: number
  installPath: string
  name: string
}

export async function detectGames(gameRepository: GameRepository): Promise<Record<number, GameInfo>> {
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
            const manifest = vdf.parse(fs.readFileSync(manifestPath, 'utf8'))
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
            console.error('Failed to read manifest:', manifestPath, error)
          }
        }
      }
    }
  }

  return games
}
