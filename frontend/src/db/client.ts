/**
 * Drizzle database client (lazy singleton).
 *
 * Lazy so importing this module never throws at build/import time when
 * DATABASE_URL is absent — the Pool is created on first actual use.
 */

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let dbInstance: NodePgDatabase<typeof schema> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new DatabaseNotConfiguredError();
    dbInstance = drizzle(new Pool({ connectionString }), { schema });
  }
  return dbInstance;
}
