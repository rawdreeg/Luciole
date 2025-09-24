import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real } from "drizzle-orm/pg-core";

/**
 * @interface Spark
 * @property {string} id - The unique identifier for the spark.
 * @property {string} flashColor - The color of the spark's flash, defaults to firefly yellow.
 * @property {Date} createdAt - The timestamp when the spark was created.
 * @property {Date} expiresAt - The timestamp when the spark will expire.
 * @property {boolean} isActive - A flag indicating if the spark is currently active.
 */
export const sparks = pgTable("sparks", {
  id: varchar("id").primaryKey(),
  flashColor: varchar("flash_color").default("#FFB800").notNull(), // Default firefly yellow
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * @interface SparkConnection
 * @property {string} id - The unique identifier for the spark connection.
 * @property {string} sparkId - The ID of the spark this connection belongs to.
 * @property {string} userId - The ID of the user connected to the spark.
 * @property {number} latitude - The latitude of the user's location.
 * @property {number} longitude - The longitude of the user's location.
 * @property {Date} lastSeen - The timestamp when the user was last seen.
 * @property {boolean} isConnected - A flag indicating if the user is currently connected.
 */
export const sparkConnections = pgTable("spark_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sparkId: varchar("spark_id").references(() => sparks.id).notNull(),
  userId: varchar("user_id").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeen: timestamp("last_seen").default(sql`now()`).notNull(),
  isConnected: boolean("is_connected").default(true).notNull(),
});

/**
 * Defines the relations for the sparks table.
 * A spark can have many connections.
 */
export const sparksRelations = relations(sparks, ({ many }) => ({
  connections: many(sparkConnections),
}));

/**
 * Defines the relations for the spark_connections table.
 * A spark connection belongs to one spark.
 */
export const sparkConnectionsRelations = relations(sparkConnections, ({ one }) => ({
  spark: one(sparks, {
    fields: [sparkConnections.sparkId],
    references: [sparks.id],
  }),
}));

/**
 * @interface User
 * @property {string} id - The unique identifier for the user.
 * @property {string} username - The user's unique username.
 * @property {string} password - The user's hashed password.
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
});
