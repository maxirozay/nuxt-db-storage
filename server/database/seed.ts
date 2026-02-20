// import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle } from 'drizzle-orm/node-postgres'
import { users } from './schema'
import 'dotenv/config'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    const db = drizzle(process.env.NUXT_DB!)
    // optional: clean up existing data
    await db.delete(users)

    await db.insert(users).values([
      {
        // id: 'admin-uuid', // sqlite
        name: 'Admin User',
        email: 'admin@example.com',
        created: new Date(),
      },
      {
        // id: 'test-uuid', // sqlite
        name: 'Test User',
        email: 'test@example.com',
        settings: { is_public: true },
      }
    ])

    console.log('✅ Seeding completed!')
  } catch (e) {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  }
}

seed()
