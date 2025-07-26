import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sparks = pgTable("sparks", {
  id: varchar("id").primaryKey(),
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

export const insertSparkSchema = createInsertSchema(sparks).omit({
  createdAt: true,
});

export const insertSparkConnectionSchema = createInsertSchema(sparkConnections).omit({
  id: true,
  lastSeen: true,
});

export type InsertSpark = z.infer<typeof insertSparkSchema>;
export type Spark = typeof sparks.$inferSelect;
export type InsertSparkConnection = z.infer<typeof insertSparkConnectionSchema>;
export type SparkConnection = typeof sparkConnections.$inferSelect;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
    sparkId: z.string(),
    userId: z.string(),
  }),
  z.object({
    type: z.literal("location"),
    latitude: z.number(),
    longitude: z.number(),
  }),
  z.object({
    type: z.literal("sync"),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("disconnect"),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;
