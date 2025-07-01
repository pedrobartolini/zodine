import { z } from "zod";
import Restify from "../../restify";
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
    all: Restify.get({
      endpoint: "/users",
      responseSchema: Restify.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    allActivity: Restify.get({
      endpoint: "/users/activity",
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: Restify.response(z.array(userActivitySchema)),
    }),
    me: Restify.get({
      endpoint: "/users/me",
      responseSchema: Restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    multiple: Restify.get({
      endpoint: "/users/multiple",
      querySchema: z.object({ user_uids: z.string().optional() }),
      responseSchema: Restify.response(
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
    meWithCompany: Restify.get({
      endpoint: "/users/me_with_company",
      responseSchema: Restify.response(
        z.object({ user: userSchema, company: companySchema }),
        (data) => () => ({
          user: userSchemaMapper(data.user),
          company: data.company,
        })
      ),
    }),
    one: Restify.get({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneActivity: Restify.get({
      endpoint: "/users/:user_uid/activity",
      pathSchema: z.object({ user_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: Restify.response(z.array(userActivitySchema)),
    }),
    oneSessions: Restify.get({
      endpoint: "/users/:user_uid/sessions",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Restify.response(
        z.array(userSessionSchema),
        (data) => () => data.map(userSessionSchemaMapper)
      ),
    }),
    oneUiPresets: Restify.get({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Restify.response(z.array(userUiPresetSchema)),
    }),
  },

  post: {
    one: Restify.post({
      endpoint: "/users",
      bodySchema: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        access_level: userAccessLevelSchema,
        company_uid: z.string(),
      }),
      responseSchema: Restify.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneUiPreset: Restify.post({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({
        name: z.string(),
        preset_json: z.record(z.any()),
      }),
      responseSchema: Restify.response(userUiPresetSchema),
    }),
  },

  put: {
    oneName: Restify.put({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneAccessLevel: Restify.put({
      endpoint: "/users/:user_uid/access_level",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ access_level: userAccessLevelSchema }),
      responseSchema: Restify.response(z.string()),
    }),
    onePassword: Restify.put({
      endpoint: "/users/:user_uid/password",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ password: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneEnabled: Restify.put({
      endpoint: "/users/:user_uid/enabled",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ enabled: z.boolean() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneUiPreset: Restify.put({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ preset_json: z.record(z.any()) }),
      responseSchema: Restify.response(userUiPresetSchema),
    }),
    oneImageAdd: Restify.put({
      endpoint: "/users/:user_uid/image_add",
      pathSchema: z.object({ user_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: Restify.response(z.string()),
    }),
    oneImageRemove: Restify.put({
      endpoint: "/users/:user_uid/image_remove",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
  },

  delete: {
    one: Restify.delete({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneUiPreset: Restify.delete({
      endpoint: "/users/:user_uid/ui_presets/:preset_name",
      pathSchema: z.object({ user_uid: z.string(), preset_name: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    meLogout: Restify.delete({
      endpoint: "/users/me/sessions/current",
      responseSchema: Restify.response(z.string()),
    }),
    oneSession: Restify.delete({
      endpoint: "/users/:user_uid/sessions/:session_token",
      pathSchema: z.object({
        user_uid: z.string(),
        session_token: z.string(),
      }),
      responseSchema: Restify.response(z.string()),
    }),
  },
};
