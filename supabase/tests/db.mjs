import { readFileSync, readdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp'

const SUPABASE_DIR = new URL('../', import.meta.url)

export const MIGRATIONS = readdirSync(SUPABASE_DIR)
  .filter((file) => /^\d{3}_.+\.sql$/.test(file))
  .sort()

export const IDS = {
  admin: '00000000-0000-0000-0000-00000000000a',
  seller: '00000000-0000-0000-0000-00000000000b',
  investor: '00000000-0000-0000-0000-00000000000c',
  outsider: '00000000-0000-0000-0000-00000000000d',
}

export const LISTINGS = {
  active: '10000000-0000-0000-0000-000000000001',
  paused: '10000000-0000-0000-0000-000000000002',
}

export const INQUIRY = '20000000-0000-0000-0000-000000000001'
export const CHAT_MESSAGE = '30000000-0000-0000-0000-000000000001'

export async function createDb() {
  const db = new PGlite({ extensions: { uuid_ossp } })
  await db.exec(readFileSync(new URL('supabase-stub.sql', import.meta.url), 'utf8'))
  for (const file of MIGRATIONS) {
    await db.exec(readFileSync(new URL(file, SUPABASE_DIR), 'utf8'))
  }
  await seed(db)
  return db
}

async function seed(db) {
  for (const [name, id] of Object.entries(IDS)) {
    const meta = { full_name: name, role: name === 'seller' ? 'seller' : 'investor' }
    await db.query(
      'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3)',
      [id, `${name}@vendalia.test`, JSON.stringify(meta)],
    )
  }
  await db.query("UPDATE public.profiles SET role = 'admin' WHERE id = $1", [IDS.admin])
  await db.query("UPDATE public.profiles SET phone_number = '+595981000000'")

  await db.query(
    `INSERT INTO public.listings (id, user_id, title, description, price, category, location, status)
     VALUES ($1, $3, 'Café activo', 'desc', 1000, 'gastronomia', 'Asunción', 'active'),
            ($2, $3, 'Café pausado', 'desc', 1000, 'gastronomia', 'Asunción', 'paused')`,
    [LISTINGS.active, LISTINGS.paused, IDS.seller],
  )
  await db.query(
    `INSERT INTO public.inquiries (id, listing_id, sender_id, receiver_id, message)
     VALUES ($1, $2, $3, $4, 'Me interesa')`,
    [INQUIRY, LISTINGS.active, IDS.investor, IDS.seller],
  )
  await db.query(
    `INSERT INTO public.chat_messages (id, inquiry_id, sender_id, content)
     VALUES ($1, $2, $3, 'Hola')`,
    [CHAT_MESSAGE, INQUIRY, IDS.investor],
  )
}

/**
 * Ejecuta `fn` como lo haría PostgREST: rol de la API y JWT del usuario,
 * dentro de una transacción que siempre se descarta.
 * Con role = null corre como superusuario (equivale al SQL Editor).
 */
export async function as(db, role, userId, fn) {
  await db.exec('BEGIN')
  try {
    if (role) {
      await db.query(
        "SELECT set_config('role', $1, TRUE), set_config('request.jwt.claim.sub', $2, TRUE)",
        [role, userId ?? ''],
      )
    }
    return await fn(db)
  } finally {
    await db.exec('ROLLBACK')
  }
}

export const DENIED = /permission denied|row-level security|no autorizado/i
