import { z } from "zod";

import Restify from "../../restify";
import {
  userActivitySchema,
  userSchema,
  userSchemaMapper,
} from "../user/schema";
import { companySchema } from "./schema";

export const companyApi = {
  get: {
    all: Restify.get({
      endpoint: "/companies",
      responseSchema: Restify.response(z.array(companySchema)),
    }),
    one: Restify.get({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string().optional() }),
      responseSchema: Restify.response(companySchema),
    }),
    multiple: Restify.get({
      endpoint: "/companies/multiple",
      querySchema: z.object({ company_uids: z.string().optional() }),
      responseSchema: Restify.response(z.record(z.string(), companySchema)),
    }),

    oneUsers: Restify.get({
      endpoint: "/companies/:company_uid/users",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Restify.response(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    }),
    oneUsersActivity: Restify.get({
      endpoint: "/companies/:company_uid/users/activity",
      pathSchema: z.object({ company_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(0) })),
      responseSchema: Restify.response(z.array(userActivitySchema)),
    }),
  },

  post: {
    one: Restify.post({
      endpoint: "/companies",
      bodySchema: z.object({ name: z.string(), description: z.string() }),
      responseSchema: Restify.response(companySchema),
    }),
  },

  put: {
    oneName: Restify.put({
      endpoint: "/companies/:company_uid/name",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneDescription: Restify.put({
      endpoint: "/companies/:company_uid/description",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ description: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneClientKey: Restify.put({
      endpoint: "/companies/:company_uid/stock_client_key",
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ stock_client_key: z.string().nullable() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneMqttKey: Restify.put({
      endpoint: "/companies/:company_uid/mqtt_key",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
    oneImageAdd: Restify.put({
      endpoint: "/companies/:company_uid/image_add",
      pathSchema: z.object({ company_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: Restify.response(z.string()),
    }),
    oneImageRemove: Restify.put({
      endpoint: "/companies/:company_uid/image_remove",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
  },

  delete: {
    one: Restify.delete({
      endpoint: "/companies/:company_uid",
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: Restify.response(z.string()),
    }),
  },
};
