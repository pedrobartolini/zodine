import { z } from "zod";
import Zodine from "../../zodine";
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

export default {
  get: {
    all: Zodine.get({
      endpoint: "/users",
      responseSchema: Zodine.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    allActivity: Zodine.get({
      endpoint: "/users/activity",
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: Zodine.response(z.array(userActivitySchema)),
    }),
    me: Zodine.get({
      endpoint: "/users/me",
      responseSchema: Zodine.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    multiple: Zodine.get({
      endpoint: "/users/multiple",
      querySchema: z.object({ user_uids: z.string().optional() }),
      responseSchema: Zodine.response(
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
    meWithCompany: Zodine.get({
      endpoint: "/users/me_with_company",
      responseSchema: Zodine.response(
        z.object({ user: userSchema, company: companySchema }),
        (data) => () => ({
          user: userSchemaMapper(data.user),
          company: data.company,
        })
      ),
    }),
    one: Zodine.get({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Zodine.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneActivity: Zodine.get({
      endpoint: "/users/:user_uid/activity",
      pathSchema: z.object({ user_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(1) })),
      responseSchema: Zodine.response(z.array(userActivitySchema)),
    }),
    oneSessions: Zodine.get({
      endpoint: "/users/:user_uid/sessions",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Zodine.response(
        z.array(userSessionSchema),
        (data) => () => data.map(userSessionSchemaMapper)
      ),
    }),
    oneUiPresets: Zodine.get({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Zodine.response(z.array(userUiPresetSchema)),
    }),
  },

  post: {
    one: Zodine.post({
      endpoint: "/users",
      bodySchema: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        access_level: userAccessLevelSchema,
        company_uid: z.string(),
      }),
      responseSchema: Zodine.response(
        userSchema,
        (data) => () => userSchemaMapper(data)
      ),
    }),
    oneUiPreset: Zodine.post({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({
        name: z.string(),
        preset_json: z.record(z.any()),
      }),
      responseSchema: Zodine.response(userUiPresetSchema),
    }),
  },

  put: {
    oneName: Zodine.put({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneAccessLevel: Zodine.put({
      endpoint: "/users/:user_uid/access_level",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ access_level: userAccessLevelSchema }),
      responseSchema: Zodine.response(z.string()),
    }),
    onePassword: Zodine.put({
      endpoint: "/users/:user_uid/password",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ password: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneEnabled: Zodine.put({
      endpoint: "/users/:user_uid/enabled",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ enabled: z.boolean() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneUiPreset: Zodine.put({
      endpoint: "/users/:user_uid/ui_presets",
      pathSchema: z.object({ user_uid: z.string() }),
      bodySchema: z.object({ preset_json: z.record(z.any()) }),
      responseSchema: Zodine.response(userUiPresetSchema),
    }),
    oneImageAdd: Zodine.put({
      endpoint: "/users/:user_uid/image_add",
      pathSchema: z.object({ user_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneImageRemove: Zodine.put({
      endpoint: "/users/:user_uid/image_remove",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
  },

  delete: {
    one: Zodine.delete({
      endpoint: "/users/:user_uid",
      pathSchema: z.object({ user_uid: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneUiPreset: Zodine.delete({
      endpoint: "/users/:user_uid/ui_presets/:preset_name",
      pathSchema: z.object({ user_uid: z.string(), preset_name: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    meLogout: Zodine.delete({
      endpoint: "/users/me/sessions/current",
      responseSchema: Zodine.response(z.string()),
    }),
    oneSession: Zodine.delete({
      endpoint: "/users/:user_uid/sessions/:session_token",
      pathSchema: z.object({
        user_uid: z.string(),
        session_token: z.string(),
      }),
      responseSchema: Zodine.response(z.string()),
    }),
  },
};
