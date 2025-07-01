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
    all: {
      endpoint: "/companies",
      method: "GET" as const,
      responseSchema: restify.schema(z.array(companySchema)),
    },
    one: {
      endpoint: "/companies/:company_uid",
      method: "GET" as const,
      pathSchema: z.object({ company_uid: z.string().optional() }),
      responseSchema: restify.schema(companySchema),
    },
    multiple: {
      endpoint: "/companies/multiple",
      method: "GET" as const,
      querySchema: z.object({ company_uids: z.string().optional() }),
      responseSchema: restify.schema(z.record(z.string(), companySchema)),
    },

    oneUsers: {
      endpoint: "/companies/:company_uid/users",
      method: "GET" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.schema(
        z.array(userSchema),
        (data) => () => data.map(userSchemaMapper)
      ),
    },
    oneUsersActivity: {
      endpoint: "/companies/:company_uid/users/activity",
      method: "GET" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      querySchema: z
        .object({ since: z.number().negative() })
        .or(z.object({ limit: z.number().min(0) })),
      responseSchema: restify.schema(z.array(userActivitySchema)),
    },
  },

  post: {
    one: {
      endpoint: "/companies",
      method: "POST" as const,
      bodySchema: z.object({ name: z.string(), description: z.string() }),
      responseSchema: restify.schema(companySchema),
    },
  },

  put: {
    oneName: {
      endpoint: "/companies/:company_uid/name",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ name: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneDescription: {
      endpoint: "/companies/:company_uid/description",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ description: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneClientKey: {
      endpoint: "/companies/:company_uid/stock_client_key",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      bodySchema: z.object({ stock_client_key: z.string().nullable() }),
      responseSchema: restify.schema(z.string()),
    },
    oneMqttKey: {
      endpoint: "/companies/:company_uid/mqtt_key",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
    oneImageAdd: {
      endpoint: "/companies/:company_uid/image_add",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      formDataSchema: z.object({ image: z.instanceof(File) }),
      responseSchema: restify.schema(z.string()),
    },
    oneImageRemove: {
      endpoint: "/companies/:company_uid/image_remove",
      method: "PUT" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
  },

  delete: {
    one: {
      endpoint: "/companies/:company_uid",
      method: "DELETE" as const,
      pathSchema: z.object({ company_uid: z.string() }),
      responseSchema: restify.schema(z.string()),
    },
  },
};
