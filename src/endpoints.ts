import * as Types from "./types";

/**
 * Helper functions for creating API endpoint definitions with proper type inference
 * These creators enforce exact type constraints to prevent extra properties
 */

type RequestSchemaWithoutMethod<TMethod extends Types.HttpMethod> = Omit<Types.RequestSchema<TMethod>, "method">;

export const createGetEndpoint = <T extends RequestSchemaWithoutMethod<"GET">>(
  config: T & { [K in Exclude<keyof T, keyof RequestSchemaWithoutMethod<"GET">>]: never }
): T & { method: "GET" } => ({ ...config, method: "GET" as const });

export const createPostEndpoint = <T extends RequestSchemaWithoutMethod<"POST">>(
  config: T & { [K in Exclude<keyof T, keyof RequestSchemaWithoutMethod<"POST">>]: never }
): T & { method: "POST" } => ({ ...config, method: "POST" as const });

export const createPutEndpoint = <T extends RequestSchemaWithoutMethod<"PUT">>(
  config: T & { [K in Exclude<keyof T, keyof RequestSchemaWithoutMethod<"PUT">>]: never }
): T & { method: "PUT" } => ({ ...config, method: "PUT" as const });

export const createDeleteEndpoint = <T extends RequestSchemaWithoutMethod<"DELETE">>(
  config: T & { [K in Exclude<keyof T, keyof RequestSchemaWithoutMethod<"DELETE">>]: never }
): T & { method: "DELETE" } => ({ ...config, method: "DELETE" as const });

export const createPatchEndpoint = <T extends RequestSchemaWithoutMethod<"PATCH">>(
  config: T & { [K in Exclude<keyof T, keyof RequestSchemaWithoutMethod<"PATCH">>]: never }
): T & { method: "PATCH" } => ({ ...config, method: "PATCH" as const });

/**
 * Namespace for endpoint factories
 */
export const Endpoints = {
  get: createGetEndpoint,
  post: createPostEndpoint,
  put: createPutEndpoint,
  delete: createDeleteEndpoint,
  patch: createPatchEndpoint
} as const;
