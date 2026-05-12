import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL must be set. Paste your Neon connection string into Replit Secrets.",
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export * from "./schema";
