// sqlite
/*
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../database/schema'
*/

// postgres
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'

export const db = drizzle(useRuntimeConfig().db, { schema })
