import { z } from "zod";
import * as Hook from "./hook";
import * as RequestCreator from "./request";
import * as Types from "./types";

type RouteFunction<
  T extends Types.RequestSchema<any>,
  TError = string
> = Types.RequesterFunction<T, TError> & {
  useHook: (
    params: Types.CallSignature<T> & { lazy?: boolean }
  ) => Hook.HookResponse<T, TError>;
};

export type GenerateApiMethods<
  T extends Types.RouteDefinitions,
  TError = string
> = {
  [K in keyof T]: T[K] extends Types.RequestSchema<any>
    ? RouteFunction<T[K], TError>
    : T[K] extends Types.RouteDefinitions
      ? GenerateApiMethods<T[K], TError>
      : never;
} & {
  /**
   * Update default headers for all requests in this API instance
   */
  setHeaders: (headers: Record<string, string>) => void;
};

/**
 * Recursively creates nested API methods based on route definitions
 */
function createNestedMethods<TError = string>(
  host: string,
  routes: Types.RouteDefinitions,
  target: any,
  prefetchCallback: Types.PrefetchCallback | undefined,
  postfetchCallback: Types.PostfetchCallback<any, TError> | undefined,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>
) {
  // Store headers and update function references for use by setHeaders method
  let currentHeaders = defaultHeaders;
  const updateTargets: Array<any> = [];

  for (const [routeName, routeValue] of Object.entries(routes)) {
    const isRequestSchema = z
      .object({
        method: z.string(),
        endpoint: z.string(),
        pathSchema: z.any().optional(),
        bodySchema: z.any().optional(),
        formDataSchema: z.any().optional(),
        querySchema: z.any().optional(),
        headersSchema: z.any().optional(),
        responseSchema: z.object({
          schema: z.any(),
          mapper: z.function().args(z.any()).returns(z.any()).optional()
        })
      })
      .safeParse(routeValue).success;

    if (isRequestSchema) {
      const requester = RequestCreator.create(
        host,
        routeValue as any,
        prefetchCallback,
        postfetchCallback,
        currentHeaders,
        errorHandler
      );
      const hook = (params: any) =>
        Hook.useHook<any, TError>(requester, params);
      (requester as any).useHook = hook;
      target[routeName] = requester;
      updateTargets.push({ target: routeName, schema: routeValue });
    } else if (typeof routeValue === "object" && routeValue !== null) {
      target[routeName] = {};
      createNestedMethods(
        host,
        routeValue as Types.RouteDefinitions,
        target[routeName],
        prefetchCallback,
        postfetchCallback,
        currentHeaders,
        errorHandler
      );
    }
  }

  // Add setHeaders method to update headers for all nested routes
  target.setHeaders = (headers: Record<string, string>) => {
    currentHeaders = headers;

    // Update existing routes with new headers
    for (const item of updateTargets) {
      const requester = RequestCreator.create(
        host,
        item.schema as any,
        prefetchCallback,
        postfetchCallback,
        headers,
        errorHandler
      );
      const hook = (params: any) =>
        Hook.useHook<any, TError>(requester, params);
      (requester as any).useHook = hook;
      target[item.target] = requester;
    }

    // Update headers for nested objects
    for (const key in target) {
      if (
        target.hasOwnProperty(key) &&
        typeof target[key] === "object" &&
        target[key] !== null &&
        typeof target[key].setHeaders === "function" &&
        key !== "setHeaders"
      ) {
        target[key].setHeaders(headers);
      }
    }
  };
}

/**
 * Builder class for creating API methods with proper type inference and compile-time validation
 */
export class ZodineBuilder<
  TRoutes extends Types.RouteDefinitions = {},
  TError = string,
  THasHost extends boolean = false,
  THasRoutes extends boolean = false,
  THasErrorHandler extends boolean = false
> {
  private host?: string;
  private routes?: TRoutes;
  private prefetchCallback?: Types.PrefetchCallback;
  private postfetchCallback?: Types.PostfetchCallback<any, TError>;
  private defaultHeaders?: Record<string, string>;
  private errorHandler?: (response: Response) => Promise<TError>;

  /**
   * Set the host URL for API requests
   */
  withHost(
    host: string
  ): ZodineBuilder<TRoutes, TError, true, THasRoutes, THasErrorHandler> {
    const builder = new ZodineBuilder<
      TRoutes,
      TError,
      true,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = host;
    builder.routes = this.routes;
    builder.prefetchCallback = this.prefetchCallback;
    builder.postfetchCallback = this.postfetchCallback;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  /**
   * Set the route definitions with proper type inference
   */
  withRoutes<T extends Types.RouteDefinitions>(
    routes: T
  ): ZodineBuilder<T, TError, THasHost, true, THasErrorHandler> {
    const builder = new ZodineBuilder<
      T,
      TError,
      THasHost,
      true,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = routes;
    builder.prefetchCallback = this.prefetchCallback;
    builder.postfetchCallback = this.postfetchCallback;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  /**
   * Set the error handler with proper type inference
   */
  withApiError<T>(
    errorHandler: (response: Response) => Promise<T>
  ): ZodineBuilder<TRoutes, T, THasHost, THasRoutes, true> {
    const builder = new ZodineBuilder<TRoutes, T, THasHost, THasRoutes, true>();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.prefetchCallback = this.prefetchCallback;
    builder.postfetchCallback = undefined; // Reset postfetch as error type changed
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = errorHandler;
    return builder;
  }

  /**
   * Set the prefetch callback that runs before each request
   */
  withPrefetch(
    callback: Types.PrefetchCallback
  ): ZodineBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new ZodineBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.prefetchCallback = callback;
    builder.postfetchCallback = this.postfetchCallback;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  /**
   * Set the postfetch callback that runs after each request
   */
  withPostfetch(
    callback: Types.PostfetchCallback<any, TError>
  ): ZodineBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new ZodineBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.prefetchCallback = this.prefetchCallback;
    builder.postfetchCallback = callback;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  /**
   * Set default headers for all requests
   */
  withDefaultHeaders(
    headers: Record<string, string>
  ): ZodineBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new ZodineBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.prefetchCallback = this.prefetchCallback;
    builder.postfetchCallback = this.postfetchCallback;
    builder.defaultHeaders = headers;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  /**
   * Build the API client with compile-time validation
   *
   * This method enforces that all required configurations are set:
   * - Host URL
   * - Route definitions
   * - Error handler
   */
  build(
    ...args: THasHost extends false
      ? ["❌ Host is required - use .withHost() first"]
      : THasRoutes extends false
        ? ["❌ Routes are required - use .withRoutes() first"]
        : THasErrorHandler extends false
          ? ["❌ Error handler is required - use .withErrorHandler() first"]
          : []
  ): THasHost extends true
    ? THasRoutes extends true
      ? THasErrorHandler extends true
        ? GenerateApiMethods<TRoutes, TError>
        : never
      : never
    : never {
    const apiMethods: any = {};
    createNestedMethods(
      this.host as string,
      this.routes as TRoutes,
      apiMethods,
      this.prefetchCallback,
      this.postfetchCallback,
      this.defaultHeaders,
      this.errorHandler as (response: Response) => Promise<TError>
    );
    return apiMethods as any;
  }
}
