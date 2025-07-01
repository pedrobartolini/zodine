import { z } from "zod";
import * as ResponseSchema from "./response";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestSchema<TMethod extends HttpMethod = HttpMethod> = {
  method: TMethod;
  endpoint: string;
  pathSchema?: z.ZodSchema<any>;
  bodySchema?: z.ZodSchema<any>;
  formDataSchema?: z.ZodSchema<any>;
  querySchema?: z.ZodSchema<any>;
  headersSchema?: z.ZodSchema<any>;
  responseSchema: ResponseSchema.ResponseSchema<any, any, any>;
  autoToast?: boolean;
};

export type RouteDefinitions = {
  [key: string]: RequestSchema<any> | RouteDefinitions;
};

// Parameter inference types
type InferURLParam<T extends RequestSchema> =
  T["pathSchema"] extends z.ZodSchema
    ? { path: z.infer<T["pathSchema"]> }
    : { path?: never };

type InferBodyParam<T extends RequestSchema> =
  T["bodySchema"] extends z.ZodSchema
    ? { body: z.infer<T["bodySchema"]> }
    : { body?: never };

type InferFormDataParam<T extends RequestSchema> =
  T["formDataSchema"] extends z.ZodSchema
    ? { formData: z.infer<T["formDataSchema"]> }
    : { formData?: never };

type InferQueryParam<T extends RequestSchema> =
  T["querySchema"] extends z.ZodSchema
    ? { query: z.infer<T["querySchema"]> }
    : { query?: never };

type InferHeaderParam<T extends RequestSchema> =
  T["headersSchema"] extends z.ZodSchema
    ? { headers: z.infer<T["headersSchema"]> }
    : { headers?: never };

export type RequesterParams<T extends RequestSchema> = InferURLParam<T> &
  InferBodyParam<T> &
  InferFormDataParam<T> &
  InferQueryParam<T> &
  InferHeaderParam<T>;

export type InferMapperParams<T extends RequestSchema> =
  ResponseSchema.InferMapperArg<T["responseSchema"]> extends undefined
    ? { map?: never }
    : { map: ResponseSchema.InferMapperArg<T["responseSchema"]> };

export type CallSignature<T extends RequestSchema> = InferURLParam<T> &
  InferBodyParam<T> &
  InferFormDataParam<T> &
  InferQueryParam<T> &
  InferHeaderParam<T> &
  InferMapperParams<T>;

export type ToasterCallback<TError = any> = (
  result: ApiResponse<any, TError>
) => Promise<void> | void;

// Core response types
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

export type RequesterFunction<
  TSchema extends RequestSchema,
  TError = string
> = ((
  params: CallSignature<TSchema>
) => Promise<
  ApiResponse<ResponseSchema.InferResult<TSchema["responseSchema"]>, TError>
>) & {
  mapper?: ResponseSchema.InferMapper<TSchema["responseSchema"]>;
};
