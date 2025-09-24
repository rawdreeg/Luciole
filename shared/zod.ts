import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { sparks, sparkConnections, users } from "./schema";

export const insertSparkSchema = createInsertSchema(sparks).omit({
  createdAt: true,
});

export const insertSparkConnectionSchema = createInsertSchema(sparkConnections).omit({
  id: true,
  lastSeen: true,
});

export const insertUserSchema = createInsertSchema(users);

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
    type: z.literal("flash"),
    timestamp: z.number(),
    synchronized: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("start_constant_blink"),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("stop_constant_blink"),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("disconnect"),
  }),
]);

export type InsertSpark = z.infer<typeof insertSparkSchema>;
export type Spark = typeof sparks.$inferSelect;
export type InsertSparkConnection = z.infer<typeof insertSparkConnectionSchema>;
export type SparkConnection = typeof sparkConnections.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WSMessage = z.infer<typeof wsMessageSchema>;