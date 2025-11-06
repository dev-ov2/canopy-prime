import Database from 'better-sqlite3'

export interface GameRecord {
  appId: string | number
  source: string
  name: string
  executable: string | null
  path: string
}

export class GameRepository {
  private readonly db: Database.Database

  constructor(databaseFile: string) {
    this.db = new Database(databaseFile)
    this.db.pragma('journal_mode = WAL')
    this.initialize()
    this.seed()
  }

  private initialize(): void {
    this.db
      .prepare(
        `
                    CREATE TABLE IF NOT EXISTS games (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            app_id TEXT NOT NULL,
                            source TEXT NOT NULL,
                            name TEXT NOT NULL,
                            executable TEXT,
                            path TEXT NOT NULL
                    )
                `
      )
      .run()

    this.db.prepare(`DROP INDEX IF EXISTS idx_games_app_id`).run()

    this.db
      .prepare(
        `
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_games_app_id_source
                    ON games (app_id, source)
                `
      )
      .run()

    this.db
      .prepare(
        `
                    CREATE INDEX IF NOT EXISTS idx_games_path
                    ON games (path)
                `
      )
      .run()

    this.db
      .prepare(
        `
                    CREATE INDEX IF NOT EXISTS idx_games_executable
                    ON games (executable)
                `
      )
      .run()
  }

  private async seed(): Promise<void> {
    // fetch the Canopy Prime mappings gist and seed the database
    const res = await fetch(
      'https://gist.githubusercontent.com/dev-ov2/a6e4d27235b9456faeb55967caf8b64f/raw/canopy-mappings.json'
    )
    const mappings = await res.json()

    for (const record of mappings as GameRecord[]) {
      this.upsert(record)
    }
  }

  private parseRow(row: any): GameRecord {
    return {
      appId: row.app_id,
      source: row.source,
      name: row.name,
      executable: row.executable,
      path: row.path,
    }
  }

  upsert(record: GameRecord): number {
    const stmt = this.db.prepare(
      `
                INSERT INTO games (app_id, source, name, executable, path)
                VALUES (@app_id, @source, @name, @executable, @path)
                ON CONFLICT(app_id, source) DO UPDATE SET
                        source = COALESCE(EXCLUDED.source, games.source),
                        name = COALESCE(EXCLUDED.name, games.name),
                        executable = COALESCE(EXCLUDED.executable, games.executable),
                        path = COALESCE(EXCLUDED.path, games.path)
            `
    )

    const result = stmt.run({
      ...record,
      app_id: record.appId?.toString(),
    })

    return Number(result.lastInsertRowid)
  }

  getByAppId(appId: string | number, source?: string): GameRecord | undefined {
    const stmt = source
      ? this.db.prepare(
          `
                        SELECT app_id, source, name, executable, path
                        FROM games
                        WHERE app_id = ? AND source = ?
                    `
        )
      : this.db.prepare(
          `
                        SELECT app_id, source, name, executable, path
                        FROM games
                        WHERE app_id = ?
                        ORDER BY id ASC
                        LIMIT 1
                    `
        )

    const row = source ? stmt.get(appId.toString(), source) : stmt.get(appId.toString())

    if (!row) return undefined
    return this.parseRow(row)
  }

  getByPath(path: string): GameRecord | undefined {
    const stmt = this.db.prepare(
      `
                SELECT app_id, source, name, executable, path
                FROM games
                WHERE path = ?
            `
    )

    const row = stmt.get(path)
    if (!row) return undefined

    return this.parseRow(row)
  }

  getByExecutable(executable: string): GameRecord | undefined {
    const stmt = this.db.prepare(
      `
                SELECT app_id, source, name, executable, path
                FROM games
                WHERE executable = ?
            `
    )

    const row = stmt.get(executable)
    if (!row) return undefined

    return this.parseRow(row)
  }

  getAll(): GameRecord[] {
    const stmt = this.db.prepare(
      `
                SELECT app_id, source, name, executable, path
                FROM games
                ORDER BY id ASC
            `
    )

    return stmt.all() as GameRecord[]
  }
}
