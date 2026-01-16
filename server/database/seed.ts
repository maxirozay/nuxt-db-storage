import { db } from '../utils/db'
import { users } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // optional: clean up existing data
    // await db.delete(users)

    await db.insert(users).values([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        createdAt: new Date(),
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      }
    ])

    console.log('✅ Seeding completed!')
  } catch (e) {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  }
}

seed()
