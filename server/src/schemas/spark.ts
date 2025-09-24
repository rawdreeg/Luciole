import { z } from "zod";

export const createSparkSchema = z.object({
  body: z.object({
    flashColor: z.string().optional(),
  }),
});

export const getSparkSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
