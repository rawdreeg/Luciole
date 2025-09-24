import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real } from "drizzle-orm/pg-core";

export const sparks = pgTable("sparks", {
  id: varchar("id").primaryKey(),
  flashColor: varchar("flash_color").default("#FFB800").notNull(), // Default firefly yellow
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const sparkConnections = pgTable("spark_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sparkId: varchar("spark_id").references(() => sparks.id).notNull(),
  userId: varchar("user_id").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeen: timestamp("last_seen").default(sql`now()`).notNull(),
  isConnected: boolean("is_connected").default(true).notNull(),
});

// Relations
export const sparksRelations = relations(sparks, ({ many }) => ({
  connections: many(sparkConnections),
}));

export const sparkConnectionsRelations = relations(sparkConnections, ({ one }) => ({
  spark: one(sparks, {
    fields: [sparkConnections.sparkId],
    references: [sparks.id],
  }),
}));

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
});
