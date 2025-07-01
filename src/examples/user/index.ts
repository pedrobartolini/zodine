import { z } from "zod";
import restify from "../../restify";
import { companySchema } from "../company/schema";
import {
  userAccessLevelSchema,
  userActivitySchema,
  userSchema,
  userSchemaMapper,
  userSessionSchema,
  userSessionSchemaMapper,
  userUiPresetSchema,
} from "./schema";

export const userApi = {
  get: {
    all: {
      endpoint: "/users",
      method: "GET" as const,
      responseSchema: restify.schema(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    },
    allActivity: {
      endpoint: "/users/activity",
      method: "GET" as const,
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: restify.schema(z.array(userActivitySchema)),
    },
    me: {
      endpoint: "/users/me",
      method: "GET" as const,
      responseSchema: restify.schema(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    },
    multiple: {
      endpoint: "/users/multiple",
      method: "GET" as const,
      querySchema: z.object({ user_uids: z.string().optional() }),
      responseSchema: restify.schema(
        z.record(z.string(), userSchema),
        (data) => () => {
          const users: Record<string, ReturnType<typeof userSchemaMapper>> = {};
          for (const [uid, user] of Object.entries(data)) {
            users[uid] = userSchemaMapper(user);
          }
          return users;
        }
      ),
    },
    meWithCompany: {
      endpoint: "/users/me_with_company",
      method: "GET" as const,
      responseSchema: restify.schema(
        z.object({ user: userSchema, company: companySchema }),
        (data) => () => ({
          user: userSchemaMapper(data.user),
          company: data.company,
        })
      ),
    },
    one: {
      endpoint: "/users/:user_uid",
      method: "GET" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.schema(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    },
    oneActivity: {
      endpoint: "/users/:user_uid/activity",
      method: "GET" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: restify.schema(z.array(userActivitySchema)),
    },
    oneSessions: {
      endpoint: "/users/:user_uid/sessions",
      method: "GET" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.schema(
        z.array(userSessionSchema),
        (data) => () => data.map(userSessionSchemaMapper)
      ),
    },
    oneUiPresets: {
      endpoint: "/users/:user_uid/ui_presets",
      method: "GET" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.schema(z.array(userUiPresetSchema)),
    },
  },

  post: {
    one: {
      endpoint: "/users",
      method: "POST" as const,
      bodySchema: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        access_level: userAccessLevelSchema,
        company_uid: z.string(),
      }),
      responseSchema: restify.schema(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    },
    oneUiPreset: {
      endpoint: "/users/:user_uid/ui_presets",
      method: "POST" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({
        name: z.string(),
        preset_json: z.record(z.any()),
      }),
      responseSchema: restify.schema(userUiPresetSchema),
    },
  },

  put: {
    oneName: {
      endpoint: "/users/:user_uid",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneAccessLevel: {
      endpoint: "/users/:user_uid/access_level",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ access_level: userAccessLevelSchema }),
      responseSchema: restify.schema(z.string()),
    },
    onePassword: {
      endpoint: "/users/:user_uid/password",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ password: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneEnabled: {
      endpoint: "/users/:user_uid/enabled",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ enabled: z.boolean() }),
      responseSchema: restify.schema(z.string()),
    },
    oneUiPreset: {
      endpoint: "/users/:user_uid/ui_presets",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ preset_json: z.record(z.any()) }),
      responseSchema: restify.schema(userUiPresetSchema),
    },
    oneImageAdd: {
      endpoint: "/users/:user_uid/image_add",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: restify.schema(z.string()),
    },
    oneImageRemove: {
      endpoint: "/users/:user_uid/image_remove",
      method: "PUT" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
  },

  delete: {
    one: {
      endpoint: "/users/:user_uid",
      method: "DELETE" as const,
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneUiPreset: {
      endpoint: "/users/:user_uid/ui_presets/:preset_name",
      method: "DELETE" as const,
      pathSchema: z.object({ user_uid: z.string(), preset_name: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    meLogout: {
      endpoint: "/users/me/sessions/current",
      method: "DELETE" as const,
      responseSchema: restify.schema(z.string()),
    },
    oneSession: {
      endpoint: "/users/:user_uid/sessions/:session_token",
      method: "DELETE" as const,
      pathSchema: z.object({
        user_uid: z.string(),
        session_token: z.string(),
      }),
      responseSchema: restify.schema(z.string()),
    },
  },
};
