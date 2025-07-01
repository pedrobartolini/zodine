// Import the Errors type separately to avoid naming conflict
export type { Errors } from "./types";

// Import required modules for Zodine object
import { ZodineBuilder } from "./core";
import { Endpoints } from "./endpoints";
import * as ResponseUtils from "./response";

/**
 * Convenience API for common usage patterns
 */
export default {
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
};
