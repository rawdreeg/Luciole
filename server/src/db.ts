import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

/**
 * Configures the WebSocket constructor for the Neon database driver.
 * This is necessary to ensure that the driver can establish a WebSocket connection.
 */
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * The database connection pool.
 * It's created using the `DATABASE_URL` from the environment variables.
 * @type {Pool}
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * The Drizzle ORM instance.
 * It's initialized with the database connection pool and the schema.
 * This is the main object to interact with the database.
 * @type {drizzle}
 */
export const db = drizzle({ client: pool, schema });