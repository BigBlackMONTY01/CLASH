import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

function getDb() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "NEON_DATABASE_URL or DATABASE_URL must be set.",
    );
  }
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return drizzle(pool, { schema });
}

let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    if (!_db) _db = getDb();
    return (_db as any)[prop];
  },
});

export * from "./schema";
