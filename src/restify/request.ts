import { z } from "zod";

import { ApiResponse, MapperError, NetworkError } from ".";
import * as ResponseSchema from "./response";
import * as Utils from "./utils";
import * as Validation from "./validation";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

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

export type ToasterCallback<TError = any> = (
  result: ApiResponse<any, TError>
) => Promise<void> | void;

export function create<TSchema extends RequestSchema, TError = string>(
  host: string,
  schema: TSchema,
  defaultToaster: ToasterCallback<TError>,
  autoToast: boolean,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>
): RequesterFunction<TSchema, TError> {
  const requester = async function (params: CallSignature<TSchema>) {
    const promise = async (): Promise<
      Omit<
        ApiResponse<
          ResponseSchema.InferResult<TSchema["responseSchema"]>,
          TError
        >,
        "toast"
      >
    > => {
      try {
        const validationError = Validation.validateInputParams(schema, params);
        if (validationError) return validationError;

        const url = Utils.buildUrl(host, schema, params);

        const responseOrError = await Utils.executeRequest(
          url,
          schema,
          params,
          defaultHeaders
        );
        if ("error" in responseOrError) {
          return responseOrError;
        }

        const response = responseOrError;
        if (!response.ok) {
          return await Utils.handleErrorResponse(response, errorHandler);
        }

        const data = await response.json();
        const validatedData = Validation.validateResponseData(
          schema,
          data,
          params.map
        );

        if (schema.responseSchema.mapper && validatedData.ok) {
          try {
            validatedData.data = schema.responseSchema.mapper(
              validatedData.data
            )(params.map);
            return validatedData;
          } catch (error) {
            return {
              ok: false,
              code: 500,
              status: "mapper_error",
              message: "Erro ao aplicar o mapper na resposta.",
              error: error instanceof Error ? error : new Error(String(error)),
            } as MapperError;
          }
        }

        return validatedData;
      } catch (error) {
        return {
          status: "network_error",
          message: "Não foi possível completar a requisição.",
          error: error instanceof Error ? error : new Error(String(error)),
        } as NetworkError;
      }
    };

    const result = (await promise()) as ApiResponse<
      ResponseSchema.InferResult<TSchema["responseSchema"]>,
      TError
    >;

    result.toast = async () => {
      const fn = defaultToaster(result);
      if (fn instanceof Promise) {
        await fn;
      }
    };

    if (autoToast || schema.autoToast) {
      result.toast();
    }

    return result;
  };

  requester.mapper = schema.responseSchema.mapper;
  return requester as RequesterFunction<TSchema, TError>;
}
