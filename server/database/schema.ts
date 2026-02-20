/* sqlite */
/* 
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  created: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  settings: text('', { mode: 'json' }).notNull().default(sql`('{}')`),
})

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  path: text('path').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  uploaded: integer('uploaded_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})
*/
/* postgres */

import { pgTable, text, integer, timestamp, json, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  created: timestamp().defaultNow(),
  settings: json().default({}),
})

export const files = pgTable('files', {
  id: integer().primaryKey().generatedByDefaultAsIdentity({ startWith: 1000 }),
  filename: text('filename').notNull(),
  path: text('path').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  uploaded: timestamp().defaultNow(),
})
