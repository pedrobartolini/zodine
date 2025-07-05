import * as Errors from "./errors";
import * as ResponseSchema from "./response";
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
  errorHandler: (response: Response) => Promise<TError>
): Types.RequesterFunction<TSchema, TError> {
  const requester = async function (params: Types.CallSignature<TSchema>) {
    const promise = async (): Promise<
      Types.ApiResponse<
        ResponseSchema.InferResult<TSchema["responseSchema"]>,
        TError
      >
    > => {
      try {
        const validationError = Validation.validateInputParams(schema, params);
        if (validationError) {
          // Call postfetchCallback with validation error if provided
          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(validationError));
          }
          return validationError;
        }

        const url = Utils.buildUrl(host, schema, params);

        // Prepare request details for prefetchCallback
        const headers = new Headers({ ...(defaultHeaders || {}) });
        if (schema.headersSchema && params.headers) {
          for (const [key, value] of Object.entries(
            params.headers as Record<string, string>
          )) {
            headers.append(key, String(value));
          }
        }

        let body: BodyInit | null = null;
        if (schema.formDataSchema && params.formData) {
          body = new FormData();
          for (const [key, value] of Object.entries(params.formData)) {
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
        } else if (schema.bodySchema && params.body) {
          body = JSON.stringify(params.body);
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
          params,
          defaultHeaders
        );

        if ("error" in responseOrError) {
          // Call postfetchCallback with network error if provided
          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(responseOrError));
          }
          return responseOrError;
        }

        const response = responseOrError;
        if (!response.ok) {
          const errorResponse = await Utils.handleErrorResponse(
            response,
            errorHandler
          );

          // Call postfetchCallback with error response if provided
          if (postfetchCallback) {
            await Promise.resolve(postfetchCallback(errorResponse));
          }

          return errorResponse;
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

            // Call postfetchCallback with successful result if provided
            if (postfetchCallback) {
              await Promise.resolve(postfetchCallback(validatedData));
            }
            return validatedData;
          } catch (error) {
            const mapperError = Errors.createMapperError(
              "Erro ao aplicar o mapper na resposta.",
              error instanceof Error ? error : new Error(String(error))
            );

            // Call postfetchCallback with mapper error if provided
            if (postfetchCallback) {
              await Promise.resolve(postfetchCallback(mapperError));
            }
            return mapperError;
          }
        }

        // Call postfetchCallback with validated data if provided
        if (postfetchCallback) {
          await Promise.resolve(postfetchCallback(validatedData));
        }
        return validatedData;
      } catch (error) {
        const networkError = Errors.createNetworkError(
          "Não foi possível completar a requisição.",
          error instanceof Error ? error : new Error(String(error))
        );

        // Call postfetchCallback with network error if provided
        if (postfetchCallback) {
          await Promise.resolve(postfetchCallback(networkError));
        }
        return networkError;
      }
    };

    const result = await promise();
    return result;
  };

  requester.mapper = schema.responseSchema.mapper;
  return requester as Types.RequesterFunction<TSchema, TError>;
}
