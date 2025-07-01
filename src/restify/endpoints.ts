import * as Types from "./types";

/**
 * Helper functions for creating API endpoint definitions with proper type inference
 */

export const createGetEndpoint = <
  T extends Omit<Types.RequestSchema<"GET">, "method">
>(
  config: T
): T & { method: "GET" } => ({
  ...config,
  method: "GET" as const,
});

export const createPostEndpoint = <
  T extends Omit<Types.RequestSchema<"POST">, "method">
>(
  config: T
): T & { method: "POST" } => ({
  ...config,
  method: "POST" as const,
});

export const createPutEndpoint = <
  T extends Omit<Types.RequestSchema<"PUT">, "method">
>(
  config: T
): T & { method: "PUT" } => ({
  ...config,
  method: "PUT" as const,
});

export const createDeleteEndpoint = <
  T extends Omit<Types.RequestSchema<"DELETE">, "method">
>(
  config: T
): T & { method: "DELETE" } => ({
  ...config,
  method: "DELETE" as const,
});

export const createPatchEndpoint = <
  T extends Omit<Types.RequestSchema<"PATCH">, "method">
>(
  config: T
): T & { method: "PATCH" } => ({
  ...config,
  method: "PATCH" as const,
});

/**
 * Namespace for endpoint factories
 */
export const Endpoints = {
  get: createGetEndpoint,
  post: createPostEndpoint,
  put: createPutEndpoint,
  delete: createDeleteEndpoint,
  patch: createPatchEndpoint,
} as const;
