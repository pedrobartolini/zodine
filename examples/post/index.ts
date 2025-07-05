import { z } from "zod";
import Zodine from "zodine";
import { postSchema } from "./schema";

export default {
  get: {
    all: Zodine.get({
      endpoint: "/posts",
      responseSchema: Zodine.response(postSchema.array())
    }),

    one: Zodine.get({
      endpoint: "/posts/:id",
      pathSchema: z.object({
        id: z.number().int()
      }),
      responseSchema: Zodine.response(postSchema)
    })
  },

  post: {
    one: Zodine.post({
      endpoint: "/posts",
      querySchema: z.object({
        title: z.string(),
        body: z.string(),
        userId: z.number().int()
      }),
      responseSchema: Zodine.response(postSchema)
    })
  },

  put: {
    one: Zodine.put({
      endpoint: "/posts/:id",
      pathSchema: z.object({
        id: z.number().int()
      }),
      querySchema: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        userId: z.number().int().optional()
      }),
      responseSchema: Zodine.response(postSchema)
    })
  },

  delete: {
    one: Zodine.delete({
      endpoint: "/posts/:id",
      pathSchema: z.object({
        id: z.number().int()
      }),
      responseSchema: Zodine.response(z.void())
    })
  }
};
