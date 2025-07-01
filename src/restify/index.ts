import { z } from "zod";

import * as Hook from "./hook";
import * as RequestSchema from "./request";
import * as ResponseSchema from "./response";

export type Success<T> = { ok: true; status: "success"; data: T };

export type ValidationError = {
  ok: false;
  code: number;
  status: "validation_error";
  message: string;
  errors: z.ZodError;
};

export type NetworkError = {
  ok: false;
  code: number;
  status: "network_error";
  message: string;
  error: Error;
};

export type CustomError<T = string> = {
  ok: false;
  code: number;
  status: "api_error";
  message: string;
  data: T;
};

export type MapperError = {
  ok: false;
  code: number;
  status: "mapper_error";
  message: string;
  error: Error;
};

export type Errors<T = string> =
  | ValidationError
  | NetworkError
  | CustomError<T>
  | MapperError;

export type ApiResponse<TData, TError = string> = (
  | Success<TData>
  | Errors<TError>
) & { toast: () => void };

export type RouteDefinitions = {
  [key: string]: RequestSchema.RequestSchema<any> | RouteDefinitions;
};

type RouteFunction<
  T extends RequestSchema.RequestSchema<any>,
  TError = string
> = RequestSchema.RequesterFunction<T, TError> & {
  useHook: (
    params: RequestSchema.CallSignature<T>
  ) => Hook.HookResponse<T, TError>;
};

type GenerateApiMethods<T extends RouteDefinitions, TError = string> = {
  [K in keyof T]: T[K] extends RequestSchema.RequestSchema<any>
    ? RouteFunction<T[K], TError>
    : T[K] extends RouteDefinitions
    ? GenerateApiMethods<T[K], TError>
    : never;
};

// Recursively creates nested methods based on the route definitions
function createNestedMethods<TError = string>(
  host: string,
  routes: RouteDefinitions,
  target: any,
  defaultToaster: RequestSchema.ToasterCallback<TError>,
  autoToast: boolean,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>
) {
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
          mapper: z.function().args(z.any()).returns(z.any()).optional(),
        }),
      })
      .safeParse(routeValue).success;

    if (isRequestSchema) {
      const requester = RequestSchema.create(
        host,
        routeValue as any,
        defaultToaster,
        autoToast,
        defaultHeaders,
        errorHandler
      );
      const hook = (params: any) =>
        Hook.useHook<any, TError>(requester, params);
      (requester as any).useHook = hook;
      target[routeName] = requester;
    } else if (typeof routeValue === "object" && routeValue !== null) {
      target[routeName] = {};
      createNestedMethods(
        host,
        routeValue as RouteDefinitions,
        target[routeName],
        defaultToaster,
        !!autoToast,
        defaultHeaders,
        errorHandler
      );
    }
  }
}

// Builder class for creating API methods with proper type inference
export class RestifyBuilder<
  TRoutes extends RouteDefinitions = {},
  TError = string,
  THasHost extends boolean = false,
  THasRoutes extends boolean = false,
  THasErrorHandler extends boolean = false
> {
  private host?: string;
  private routes?: TRoutes;
  private defaultToaster?: RequestSchema.ToasterCallback<TError>;
  private autoToast?: boolean;
  private defaultHeaders?: Record<string, string>;
  private errorHandler?: (response: Response) => Promise<TError>;

  // Set the host URL
  withHost(
    host: string
  ): RestifyBuilder<TRoutes, TError, true, THasRoutes, THasErrorHandler> {
    const builder = new RestifyBuilder<
      TRoutes,
      TError,
      true,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = host;
    builder.routes = this.routes;
    builder.defaultToaster = this.defaultToaster;
    builder.autoToast = this.autoToast;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  // Set the route definitions with proper type inference
  withRoutes<T extends RouteDefinitions>(
    routes: T
  ): RestifyBuilder<T, TError, THasHost, true, THasErrorHandler> {
    const builder = new RestifyBuilder<
      T,
      TError,
      THasHost,
      true,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = routes;
    builder.defaultToaster = this.defaultToaster;
    builder.autoToast = this.autoToast;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  // Set the error handler with proper type inference
  withErrorHandler<T>(
    errorHandler: (response: Response) => Promise<T>
  ): RestifyBuilder<TRoutes, T, THasHost, THasRoutes, true> {
    const builder = new RestifyBuilder<
      TRoutes,
      T,
      THasHost,
      THasRoutes,
      true
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.defaultToaster = undefined; // Reset toaster as error type changed
    builder.autoToast = this.autoToast;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = errorHandler;
    return builder;
  }

  // Set the default toaster
  withDefaultToaster(
    toaster: RequestSchema.ToasterCallback<TError>
  ): RestifyBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new RestifyBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.defaultToaster = toaster;
    builder.autoToast = this.autoToast;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  // Set auto toast option
  withAutoToast(
    autoToast: boolean = true
  ): RestifyBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new RestifyBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.defaultToaster = this.defaultToaster;
    builder.autoToast = autoToast;
    builder.defaultHeaders = this.defaultHeaders;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  // Set default headers
  withDefaultHeaders(
    headers: Record<string, string>
  ): RestifyBuilder<TRoutes, TError, THasHost, THasRoutes, THasErrorHandler> {
    const builder = new RestifyBuilder<
      TRoutes,
      TError,
      THasHost,
      THasRoutes,
      THasErrorHandler
    >();
    builder.host = this.host;
    builder.routes = this.routes;
    builder.defaultToaster = this.defaultToaster;
    builder.autoToast = this.autoToast;
    builder.defaultHeaders = headers;
    builder.errorHandler = this.errorHandler;
    return builder;
  }

  // Build method that shows compile-time errors when requirements are missing
  build<_Never = never>(
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
      this.defaultToaster ?? ((() => {}) as RequestSchema.ToasterCallback),
      !!this.autoToast,
      this.defaultHeaders,
      this.errorHandler as (response: Response) => Promise<TError>
    );
    return apiMethods as any;
  }
}

// Helper functions for creating API definitions with proper type inference
export const createGetEndpoint = <
  T extends Omit<RequestSchema.RequestSchema<"GET">, "method">
>(
  config: T
): T & { method: "GET" } => ({
  ...config,
  method: "GET" as const,
});

export const createPostEndpoint = <
  T extends Omit<RequestSchema.RequestSchema<"POST">, "method">
>(
  config: T
): T & { method: "POST" } => ({
  ...config,
  method: "POST" as const,
});

export const createPutEndpoint = <
  T extends Omit<RequestSchema.RequestSchema<"PUT">, "method">
>(
  config: T
): T & { method: "PUT" } => ({
  ...config,
  method: "PUT" as const,
});

export const createDeleteEndpoint = <
  T extends Omit<RequestSchema.RequestSchema<"DELETE">, "method">
>(
  config: T
): T & { method: "DELETE" } => ({
  ...config,
  method: "DELETE" as const,
});

export default {
  builder: () => new RestifyBuilder(),
  response: ResponseSchema.create,
  get: createGetEndpoint,
  post: createPostEndpoint,
  put: createPutEndpoint,
  delete: createDeleteEndpoint,
};
