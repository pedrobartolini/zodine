import * as Errors from "./errors";
import * as ResponseSchema from "./response";
import { Language, t } from "./translations";
import * as Types from "./types";
import * as Utils from "./utils";
import * as Validation from "./validation";

export function create<TSchema extends Types.RequestSchema, TError = string>(
  host: string,
  schema: TSchema,
  prefetchCallback: Types.PrefetchCallback | undefined,
  postfetchCallback:
    | Types.PostfetchCallback<
        ResponseSchema.InferResult<TSchema["responseSchema"]>,
        TError
      >
    | undefined,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>,
  language: Language = "en"
): Types.RequesterFunction<TSchema, TError> {
  const translations = t(language);
  const requester = async function (
    params: Types.CallSignature<TSchema>,
    dontMap?: boolean
  ) {
    const promise = async (): Promise<
      Types.ApiResponse<
        ResponseSchema.InferResult<TSchema["responseSchema"]>,
        TError
      >
    > => {
      try {
        const [validatedParams, validationError] =
          Validation.validateInputParams(schema, params, language);
        if (validationError) {
          // Call postfetchCallback with validation error if provided
          const nError = {
            ...validationError,
            endpoint: schema.endpoint,
            method: schema.method
          };

          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(nError));
          }
          return nError;
        }

        const url = Utils.buildUrl(host, schema, validatedParams);

        // Prepare request details for prefetchCallback
        const headers = new Headers({ ...(defaultHeaders || {}) });
        if (schema.headersSchema && validatedParams.headers) {
          for (const [key, value] of Object.entries(
            validatedParams.headers as Record<string, string>
          )) {
            headers.append(key, String(value));
          }
        }

        let body: BodyInit | null = null;
        if (schema.formDataSchema && validatedParams.formData) {
          body = new FormData();
          for (const [key, value] of Object.entries(validatedParams.formData)) {
            if (value instanceof Array) {
              if (value.length !== 0 && value[0] instanceof File) {
                for (const item of value) {
                  (body as FormData).append(key, item);
                }
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
          await Promise.resolve(
            prefetchCallback({
              url,
              method: schema.method,
              headers,
              body
            })
          );
        }

        const responseOrError = await Utils.executeRequest(
          url,
          schema,
          validatedParams,
          defaultHeaders,
          language
        );

        if ("error" in responseOrError) {
          const nError = {
            ...responseOrError,
            endpoint: url,
            method: schema.method
          };

          // Call postfetchCallback with network error if provided
          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(nError));
          }
          return nError;
        }

        const response = responseOrError;
        if (!response.ok) {
          const errorResponse = await Utils.handleErrorResponse(
            response,
            errorHandler,
            language
          );

          const nError = {
            ...errorResponse,
            endpoint: url,
            method: schema.method
          };

          // Call postfetchCallback with error response if provided
          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(nError));
          }

          return nError;
        }

        const data = await response.json();

        const validatedData = Validation.validateResponseData(
          schema,
          data,
          params.map,
          !dontMap,
          language
        );

        // if (!dontMap && schema.responseSchema.mapper && validatedData.ok) {
        //   try {
        //     validatedData.data = schema.responseSchema.mapper(
        //       validatedData.data
        //     )(params.map);

        //     const nError = {
        //       ...validatedData,
        //       endpoint: url,
        //       method: schema.method
        //     };

        //     // Call postfetchCallback with successful result if provided
        //     if (postfetchCallback) {
        //       await Promise.resolve(postfetchCallback(nError));
        //     }
        //     return nError;
        //   } catch (error) {
        //     const mapperError = Errors.createMapperError(
        //       translations.errors.mapperError,
        //       error instanceof Error ? error : new Error(String(error))
        //     );

        //     const nError = {
        //       ...mapperError,
        //       endpoint: schema.endpoint,
        //       method: schema.method
        //     };

        //     // Call postfetchCallback with mapper error if provided
        //     if (postfetchCallback) {
        //       await Promise.resolve(postfetchCallback(nError));
        //     }
        //     return nError;
        //   }
        // }

        const nError = {
          ...validatedData,
          endpoint: schema.endpoint,
          method: schema.method
        };

        // Call postfetchCallback with validated data if provided
        if (postfetchCallback) {
          await Promise.resolve(postfetchCallback(nError));
        }
        return nError;
      } catch (error) {
        const networkError = Errors.createNetworkError(
          translations.errors.requestFailed,
          error instanceof Error ? error : new Error(String(error))
        );

        const nError = {
          ...networkError,
          endpoint: schema.endpoint,
          method: schema.method
        };

        // Call postfetchCallback with network error if provided
        if (postfetchCallback) {
          await Promise.resolve(postfetchCallback(nError));
        }
        return nError;
      }
    };

    const result = await promise();
    return result;
  };

  requester.mapper = schema.responseSchema.mapper;
  return requester as Types.RequesterFunction<TSchema, TError>;
}
