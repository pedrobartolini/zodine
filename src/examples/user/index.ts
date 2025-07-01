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
    all: restify.get({
      endpoint: "/users",
      responseSchema: restify.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    allActivity: restify.get({
      endpoint: "/users/activity",
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: restify.response(z.array(userActivitySchema)),
    }),
    me: restify.get({
      endpoint: "/users/me",
      responseSchema: restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    multiple: restify.get({
      endpoint: "/users/multiple",
      querySchema: z.object({ user_uids: z.string().optional() }),
      responseSchema: restify.response(
        z.record(z.string(), userSchema),
        (data) => () => {
          const users: Record<string, ReturnType<typeof userSchemaMapper>> = {};
          for (const [uid, user] of Object.entries(data)) {
            users[uid] = userSchemaMapper(user);
          }
          return users;
        }
      ),
    }),
    meWithCompany: restify.get({
      endpoint: "/users/me_with_company",
      responseSchema: restify.response(
        z.object({ user: userSchema, company: companySchema }),
        (data) => () => ({
          user: userSchemaMapper(data.user),
          company: data.company,
        })
      ),
    }),
    one: restify.get({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneActivity: restify.get({
      endpoint: "/users/:user_uid/activity",
      pathSchema: z.object({ user_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: restify.response(z.array(userActivitySchema)),
    }),
    oneSessions: restify.get({
      endpoint: "/users/:user_uid/sessions",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.response(
        z.array(userSessionSchema),
        (data) => () => data.map(userSessionSchemaMapper)
      ),
    }),
    oneUiPresets: restify.get({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.response(z.array(userUiPresetSchema)),
    }),
  },

  post: {
    one: restify.post({
      endpoint: "/users",
      bodySchema: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        access_level: userAccessLevelSchema,
        company_uid: z.string(),
      }),
      responseSchema: restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneUiPreset: restify.post({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({
        name: z.string(),
        preset_json: z.record(z.any()),
      }),
      responseSchema: restify.response(userUiPresetSchema),
    }),
  },

  put: {
    oneName: restify.put({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneAccessLevel: restify.put({
      endpoint: "/users/:user_uid/access_level",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ access_level: userAccessLevelSchema }),
      responseSchema: restify.response(z.string()),
    }),
    onePassword: restify.put({
      endpoint: "/users/:user_uid/password",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ password: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneEnabled: restify.put({
      endpoint: "/users/:user_uid/enabled",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ enabled: z.boolean() }),
      responseSchema: restify.response(z.string()),
    }),
    oneUiPreset: restify.put({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ preset_json: z.record(z.any()) }),
      responseSchema: restify.response(userUiPresetSchema),
    }),
    oneImageAdd: restify.put({
      endpoint: "/users/:user_uid/image_add",
      pathSchema: z.object({ user_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: restify.response(z.string()),
    }),
    oneImageRemove: restify.put({
      endpoint: "/users/:user_uid/image_remove",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
  },

  delete: {
    one: restify.delete({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneUiPreset: restify.delete({
      endpoint: "/users/:user_uid/ui_presets/:preset_name",
      pathSchema: z.object({ user_uid: z.string(), preset_name: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    meLogout: restify.delete({
      endpoint: "/users/me/sessions/current",
      responseSchema: restify.response(z.string()),
    }),
    oneSession: restify.delete({
      endpoint: "/users/:user_uid/sessions/:session_token",
      pathSchema: z.object({
        user_uid: z.string(),
        session_token: z.string(),
      }),
      responseSchema: restify.response(z.string()),
    }),
  },
};
