import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// App tables. After changing this file run
// `pnpm run db:generate --name <what_changed>` and `pnpm run db:migrate`.
// Migrations are applied to the production D1 database on publish.

/** Every message sent through the contact form. */
export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    /** SHA-256 of the sender's address and browser, used for the rate limit. */
    ipHash: text('ip_hash').notNull(),
    userAgent: text('user_agent'),
    /** True once the message was emailed to `portfolio.ownerEmail`. */
    emailed: integer('emailed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [
    index('contact_messages_ip_hash_created_at_idx').on(
      table.ipHash,
      table.createdAt
    )
  ]
);
