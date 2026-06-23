import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// Strip `sslmode`/`channel_binding` from the connection string and configure TLS
// via the explicit `ssl` option instead. The node-postgres driver emits a libpq
// deprecation warning when it parses `sslmode` from the URL; moving SSL config
// out of the string silences it while keeping TLS enforced (required by Neon).
const rawUrl = process.env.DATABASE_URL ?? "";
const wantsSsl = /sslmode=(require|verify-full|verify-ca)/.test(rawUrl);
const connectionString = rawUrl.replace(
  /[?&](sslmode|channel_binding)=[^&]*/g,
  "",
);

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    ssl: wantsSsl ? { rejectUnauthorized: true } : undefined,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export type Database = typeof db;
