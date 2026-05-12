import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDb() {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "NEON_DATABASE_URL must be set. Add your Neon connection string to Replit Secrets.",
    );
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    if (!_db) _db = getDb();
    return (_db as any)[prop];
  },
});

export * from "./schema";
