/**
 * Zodine - A type-safe, composable REST API client builder
 *
 * Provides:
 * - Type-safe API definitions with Zod validation
 * - Builder pattern for configuration
 * - React hooks integration
 * - Automatic error handling and response mapping
 * - Compile-time validation of required configurations
 */

// Core exports
export { ZodineBuilder } from "./core";
export type { GenerateApiMethods } from "./core";

// Type exports
export type {
  ApiResponse,
  CallSignature,
  CustomError,
  HttpMethod,
  MapperError,
  NetworkError,
  RequesterFunction,
  RequesterParams,
  RequestSchema,
  RouteDefinitions,
  Success,
  ToasterCallback,
  ValidationError,
} from "./types";

// Import the Errors type separately to avoid naming conflict
export type { Errors } from "./types";

// Response schema utilities
export * as ResponseUtils from "./response";

// Endpoint factories
export {
  createDeleteEndpoint,
  createGetEndpoint,
  createPatchEndpoint,
  createPostEndpoint,
  createPutEndpoint,
  Endpoints,
} from "./endpoints";

// Error utilities
export * as ErrorUtils from "./errors";

// Hook for React integration
export { useHook } from "./hook";
export type { HookResponse } from "./hook";

import { z } from "zod";
// Import required modules for Zodine object
import { ZodineBuilder } from "./core";
import { Endpoints } from "./endpoints";
import * as ResponseUtils from "./response";

/**
 * Convenience API for common usage patterns
 */
export const Zodine = {
  /**
   * Create a new API client builder
   */
  builder: () => new ZodineBuilder(),

  /**
   * Response schema factory
   */
  response: ResponseUtils.create,

  /**
   * Create a new GET endpoint
   */
  get: Endpoints.get,

  /**
   * Create a new POST endpoint
   */
  post: Endpoints.post,

  /**
   * Create a new PUT endpoint
   */
  put: Endpoints.put,

  /**
   * Create a new DELETE endpoint
   */
  delete: Endpoints.delete,

  /**
   * Create a new PATCH endpoint
   */
  patch: Endpoints.patch,

  /**
   * Zod schema utilities
   * Provides Zod integration for request and response schemas
   */
  z: z,
} as const;

/**
 * Default export for simple usage
 */
export default Zodine;
