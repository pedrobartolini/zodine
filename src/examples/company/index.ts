import { z } from "zod";

import restify from "../../restify";
import {
  userActivitySchema,
  userSchema,
  userSchemaMapper,
} from "../user/schema";
import { companySchema } from "./schema";

export const companyApi = {
  get: {
    all: restify.get({
      endpoint: "/companies",
      responseSchema: restify.response(z.array(companySchema)),
    }),
    one: restify.get({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string().optional() }),
      responseSchema: restify.response(companySchema),
    }),
    multiple: restify.get({
      endpoint: "/companies/multiple",
      querySchema: z.object({ company_uids: z.string().optional() }),
      responseSchema: restify.response(z.record(z.string(), companySchema)),
    }),

    oneUsers: restify.get({
      endpoint: "/companies/:company_uid/users",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    oneUsersActivity: restify.get({
      endpoint: "/companies/:company_uid/users/activity",
      pathSchema: z.object({ company_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(0) })),
      responseSchema: restify.response(z.array(userActivitySchema)),
    }),
  },

  post: {
    one: restify.post({
      endpoint: "/companies",
      bodySchema: z.object({ name: z.string(), description: z.string() }),
      responseSchema: restify.response(companySchema),
    }),
  },

  put: {
    oneName: restify.put({
      endpoint: "/companies/:company_uid/name",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneDescription: restify.put({
      endpoint: "/companies/:company_uid/description",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ description: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneClientKey: restify.put({
      endpoint: "/companies/:company_uid/stock_client_key",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ stock_client_key: z.string().nullable() }),
      responseSchema: restify.response(z.string()),
    }),
    oneMqttKey: restify.put({
      endpoint: "/companies/:company_uid/mqtt_key",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
    oneImageAdd: restify.put({
      endpoint: "/companies/:company_uid/image_add",
      pathSchema: z.object({ company_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: restify.response(z.string()),
    }),
    oneImageRemove: restify.put({
      endpoint: "/companies/:company_uid/image_remove",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
  },

  delete: {
    one: restify.delete({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.response(z.string()),
    }),
  },
};
