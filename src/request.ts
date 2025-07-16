import * as Errors from "./errors";
import * as ResponseSchema from "./response";
import { Language, t } from "./translations";
import * as Types from "./types";
import * as Utils from "./utils";
import * as Validation from "./validation";

function hasAnyUndefined(obj: any): boolean {
  if (obj === undefined) return true;
  if (typeof obj !== "object" || obj === null) return false;
  for (const key in obj) {
    if (hasAnyUndefined(obj[key])) return true;
  }
  return false;
}

function dispatchPostFetchCallback(callback?: Types.PostfetchCallback, args?: any): void {
  if (callback) {
    Promise.resolve()
      .then(() => callback(args))
      .catch(() => {});
  }
}

export function create<TSchema extends Types.RequestSchema, TError = string>(
  host: string,
  schema: TSchema,
  prefetchCallback: Types.PrefetchCallback | undefined,
  postfetchCallback: Types.PostfetchCallback<ResponseSchema.InferResult<TSchema["responseSchema"]>, TError> | undefined,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>,
  language: Language = "en"
): Types.RequesterFunction<TSchema, TError> {
  const translations = t(language);
  const requester = async function (params: Types.CallSignature<TSchema>) {
    const promise = async (): Promise<Types.ApiResponse<ResponseSchema.InferResult<TSchema["responseSchema"]>, TError>> => {
      try {
        const [validatedParams, validationError] = Validation.validateInputParams(schema, params, language);

        if (params.preventFetchingWithUndefinedParams && hasAnyUndefined(validatedParams)) {
          const undefinedError = Errors.createUndefinedParamError(translations.errors.undefinedParams, 400);
          const nError = { ...undefinedError, endpoint: schema.endpoint, method: schema.method };
          dispatchPostFetchCallback(postfetchCallback, nError);
          return nError;
        }

        if (validationError) {
          const nError = { ...validationError, endpoint: schema.endpoint, method: schema.method };
          dispatchPostFetchCallback(postfetchCallback, nError);
          return nError;
        }

        const url = Utils.buildUrl(host, schema, validatedParams);

        // Prepare request details for prefetchCallback
        const headers = new Headers({ ...(defaultHeaders || {}) });
        if (schema.headersSchema && validatedParams.headers) {
          for (const [key, value] of Object.entries(validatedParams.headers as Record<string, string>)) {
            headers.append(key, String(value));
          }
        }

        let body: BodyInit | null = null;
        if (schema.formDataSchema && validatedParams.formData) {
          body = new FormData();
          for (const [key, value] of Object.entries(validatedParams.formData)) {
            if (value instanceof Array) {
              if (value.length !== 0 && value[0] instanceof File) {
                for (const item of value) (body as FormData).append(key, item);
                continue;
              }
            }
            (body as FormData).append(key, value);
          }
        } else if (schema.bodySchema && validatedParams.body) {
          body = JSON.stringify(validatedParams.body);
          headers.append("Content-Type", "application/json");
        }

        // Call prefetchCallback if provided
        if (prefetchCallback) {
          await Promise.resolve(prefetchCallback({ url, method: schema.method, headers, body }));
        }

        const responseOrError = await Utils.executeRequest(url, schema, validatedParams, defaultHeaders, language);
        if ("error" in responseOrError) {
          const nError = { ...responseOrError, endpoint: url, method: schema.method };
          dispatchPostFetchCallback(postfetchCallback, nError);
          return nError;
        }

        const response = responseOrError;
        if (!response.ok) {
          const errorResponse = await Utils.handleErrorResponse(response, errorHandler, language);
          const nError = { ...errorResponse, endpoint: url, method: schema.method };
          dispatchPostFetchCallback(postfetchCallback, nError);
          return nError;
        }

        const data = await response.json();
        const validatedData = Validation.validateResponseData(schema, data, params.map, !params.skipMapper, language);
        const nError = { ...validatedData, endpoint: schema.endpoint, method: schema.method };
        dispatchPostFetchCallback(postfetchCallback, nError);

        return nError;
      } catch (error) {
        const networkError = Errors.createNetworkError(translations.errors.requestFailed, error instanceof Error ? error : new Error(String(error)));
        const nError = { ...networkError, endpoint: schema.endpoint, method: schema.method };
        dispatchPostFetchCallback(postfetchCallback, nError);
        return nError;
      }
    };

    const result = await promise();
    return result;
  };

  requester.mapper = schema.responseSchema.mapper;
  return requester as Types.RequesterFunction<TSchema, TError>;
}
