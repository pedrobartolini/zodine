import { z } from "zod";
import Zodine from "../src";

// User schema for a more complex example
const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z
    .object({
      street: z.string(),
      suite: z.string(),
      city: z.string(),
      zipcode: z.string(),
      geo: z.object({
        lat: z.string(),
        lng: z.string()
      })
    })
    .optional(),
  company: z
    .object({
      name: z.string(),
      catchPhrase: z.string(),
      bs: z.string()
    })
    .optional()
});

// Comments schema
const commentSchema = z.object({
  id: z.number().int(),
  postId: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  body: z.string()
});

// Albums schema
const albumSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  title: z.string()
});

// Photos schema
const photoSchema = z.object({
  id: z.number().int(),
  albumId: z.number().int(),
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url()
});

// Define comprehensive API routes
const users = {
  getAll: Zodine.get({
    endpoint: "/users",
    responseSchema: Zodine.response(userSchema.array())
  }),

  getById: Zodine.get({
    endpoint: "/users/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    responseSchema: Zodine.response(userSchema)
  }),

  create: Zodine.post({
    endpoint: "/users",
    querySchema: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      username: z.string().min(1)
    }),
    responseSchema: Zodine.response(userSchema)
  }),

  update: Zodine.put({
    endpoint: "/users/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    querySchema: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      username: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional()
    }),
    responseSchema: Zodine.response(userSchema)
  }),

  delete: Zodine.delete({
    endpoint: "/users/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    responseSchema: Zodine.response(z.void())
  })
};

const comments = {
  getAll: Zodine.get({
    endpoint: "/comments",
    querySchema: z
      .object({
        postId: z.number().int().optional(),
        name: z.string().optional(),
        email: z.string().email().optional()
      })
      .optional(),
    responseSchema: Zodine.response(commentSchema.array())
  }),

  getById: Zodine.get({
    endpoint: "/comments/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    responseSchema: Zodine.response(commentSchema)
  }),

  getByPost: Zodine.get({
    endpoint: "/posts/:postId/comments",
    pathSchema: z.object({
      postId: z.number().int()
    }),
    responseSchema: Zodine.response(commentSchema.array())
  }),

  create: Zodine.post({
    endpoint: "/comments",
    querySchema: z.object({
      postId: z.number().int(),
      name: z.string().min(1),
      email: z.string().email(),
      body: z.string().min(1)
    }),
    responseSchema: Zodine.response(commentSchema)
  })
};

const albums = {
  getAll: Zodine.get({
    endpoint: "/albums",
    querySchema: z
      .object({
        userId: z.number().int().optional()
      })
      .optional(),
    responseSchema: Zodine.response(albumSchema.array())
  }),

  getById: Zodine.get({
    endpoint: "/albums/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    responseSchema: Zodine.response(albumSchema)
  }),

  getByUser: Zodine.get({
    endpoint: "/users/:userId/albums",
    pathSchema: z.object({
      userId: z.number().int()
    }),
    responseSchema: Zodine.response(albumSchema.array())
  })
};

const photos = {
  getAll: Zodine.get({
    endpoint: "/photos",
    querySchema: z
      .object({
        albumId: z.number().int().optional(),
        _limit: z.number().int().min(1).max(100).optional(),
        _start: z.number().int().min(0).optional()
      })
      .optional(),
    responseSchema: Zodine.response(photoSchema.array())
  }),

  getById: Zodine.get({
    endpoint: "/photos/:id",
    pathSchema: z.object({
      id: z.number().int()
    }),
    responseSchema: Zodine.response(photoSchema)
  }),

  getByAlbum: Zodine.get({
    endpoint: "/albums/:albumId/photos",
    pathSchema: z.object({
      albumId: z.number().int()
    }),
    responseSchema: Zodine.response(photoSchema.array(), (data) => () => "")
  })
};

export {
  albums,
  albumSchema,
  comments,
  commentSchema,
  photos,
  photoSchema,
  users,
  userSchema
};
