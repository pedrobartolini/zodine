import { z } from "zod";

import Zodine from "../../zodine";
import {
  userActivitySchema,
  userSchema,
  userSchemaMapper,
} from "../user/schema";
import { companySchema } from "./schema";

export const companyApi = {
  get: {
    all: Zodine.get({
      endpoint: "/companies",
      responseSchema: Zodine.response(z.array(companySchema)),
    }),
    one: Zodine.get({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string().optional() }),
      responseSchema: Zodine.response(companySchema),
    }),
    multiple: Zodine.get({
      endpoint: "/companies/multiple",
      querySchema: z.object({ company_uids: z.string().optional() }),
      responseSchema: Zodine.response(z.record(z.string(), companySchema)),
    }),

    oneUsers: Zodine.get({
      endpoint: "/companies/:company_uid/users",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Zodine.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    oneUsersActivity: Zodine.get({
      endpoint: "/companies/:company_uid/users/activity",
      pathSchema: z.object({ company_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(0) })),
      responseSchema: Zodine.response(z.array(userActivitySchema)),
    }),
  },

  post: {
    one: Zodine.post({
      endpoint: "/companies",
      bodySchema: z.object({ name: z.string(), description: z.string() }),
      responseSchema: Zodine.response(companySchema),
    }),
  },

  put: {
    oneName: Zodine.put({
      endpoint: "/companies/:company_uid/name",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneDescription: Zodine.put({
      endpoint: "/companies/:company_uid/description",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ description: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneClientKey: Zodine.put({
      endpoint: "/companies/:company_uid/stock_client_key",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ stock_client_key: z.string().nullable() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneMqttKey: Zodine.put({
      endpoint: "/companies/:company_uid/mqtt_key",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneImageAdd: Zodine.put({
      endpoint: "/companies/:company_uid/image_add",
      pathSchema: z.object({ company_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: Zodine.response(z.string()),
    }),
    oneImageRemove: Zodine.put({
      endpoint: "/companies/:company_uid/image_remove",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
  },

  delete: {
    one: Zodine.delete({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Zodine.response(z.string()),
    }),
  },
};
