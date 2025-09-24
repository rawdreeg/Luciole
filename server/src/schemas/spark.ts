import { z } from "zod";

/**
 * Zod schema for validating the request body when creating a new spark.
 * It expects an optional `flashColor` string.
 */
export const createSparkSchema = z.object({
  body: z.object({
    flashColor: z.string().optional(),
  }),
});

/**
 * Zod schema for validating the request parameters when retrieving a spark.
 * It expects a `id` string in the URL parameters.
 */
export const getSparkSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
