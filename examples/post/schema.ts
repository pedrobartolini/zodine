import { z } from "zod";

export const postSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
  userId: z.number().int()
});

export type Post = z.infer<typeof postSchema>;
