import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { sparks, sparkConnections, users } from "./schema";

/**
 * Zod schema for inserting a new spark, omitting the `createdAt` field.
 * @see {@link sparks}
 */
export const insertSparkSchema = createInsertSchema(sparks).omit({
  createdAt: true,
});

/**
 * Zod schema for inserting a new spark connection, omitting `id` and `lastSeen`.
 * @see {@link sparkConnections}
 */
export const insertSparkConnectionSchema = createInsertSchema(sparkConnections).omit({
  id: true,
  lastSeen: true,
});

/**
 * Zod schema for inserting a new user.
 * @see {@link users}
 */
export const insertUserSchema = createInsertSchema(users);

/**
 * Zod schema for WebSocket messages, discriminated by the `type` field.
 * This schema covers all possible message types exchanged over the WebSocket.
 */
export const wsMessageSchema = z.discriminatedUnion("type", [
  /**
   * Message to join a spark.
   * @property {string} type - The type of the message, always "join".
   * @property {string} sparkId - The ID of the spark to join.
   * @property {string} userId - The ID of the user joining.
   */
  z.object({
    type: z.literal("join"),
    sparkId: z.string(),
    userId: z.string(),
  }),
  /**
   * Message to update the user's location.
   * @property {string} type - The type of the message, always "location".
   * @property {number} latitude - The user's latitude.
   * @property {number} longitude - The user's longitude.
   */
  z.object({
    type: z.literal("location"),
    latitude: z.number(),
    longitude: z.number(),
  }),
  /**
   * Message for time synchronization.
   * @property {string} type - The type of the message, always "sync".
   * @property {number} timestamp - The server's timestamp.
   */
  z.object({
    type: z.literal("sync"),
    timestamp: z.number(),
  }),
  /**
   * Message to trigger a flash.
   * @property {string} type - The type of the message, always "flash".
   * @property {number} timestamp - The timestamp for the flash event.
   * @property {boolean} [synchronized] - Whether the flash is synchronized.
   */
  z.object({
    type: z.literal("flash"),
    timestamp: z.number(),
    synchronized: z.boolean().optional(),
  }),
  /**
   * Message to start a constant blink.
   * @property {string} type - The type of the message, always "start_constant_blink".
   * @property {number} timestamp - The timestamp to start the blinking.
   */
  z.object({
    type: z.literal("start_constant_blink"),
    timestamp: z.number(),
  }),
  /**
   * Message to stop a constant blink.
   * @property {string} type - The type of the message, always "stop_constant_blink".
   * @property {number} timestamp - The timestamp to stop the blinking.
   */
  z.object({
    type: z.literal("stop_constant_blink"),
    timestamp: z.number(),
  }),
  /**
   * Message to disconnect from the spark.
   * @property {string} type - The type of the message, always "disconnect".
   */
  z.object({
    type: z.literal("disconnect"),
  }),
]);

/**
 * TypeScript type for inserting a new spark.
 * @see {@link insertSparkSchema}
 */
export type InsertSpark = z.infer<typeof insertSparkSchema>;

/**
 * TypeScript type for a spark record.
 * @see {@link sparks}
 */
export type Spark = typeof sparks.$inferSelect;

/**
 * TypeScript type for inserting a new spark connection.
 * @see {@link insertSparkConnectionSchema}
 */
export type InsertSparkConnection = z.infer<typeof insertSparkConnectionSchema>;

/**
 * TypeScript type for a spark connection record.
 * @see {@link sparkConnections}
 */
export type SparkConnection = typeof sparkConnections.$inferSelect;

/**
 * TypeScript type for inserting a new user.
 * @see {@link insertUserSchema}
 */
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * TypeScript type for a user record.
 * @see {@link users}
 */
export type User = typeof users.$inferSelect;

/**
 * TypeScript type for a WebSocket message.
 * @see {@link wsMessageSchema}
 */
export type WSMessage = z.infer<typeof wsMessageSchema>;