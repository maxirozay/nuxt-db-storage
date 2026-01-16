import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

// Connect to the database
const sqlite = new Database('sqlite.db')
const db = drizzle(sqlite)

console.log('⏳ Running migrations...')

try {
  // Read migrations from the output folder (must match drizzle.config.ts)
  migrate(db, { migrationsFolder: './server/database/migrations' })
  console.log('✅ Migrations completed successfully!')
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
