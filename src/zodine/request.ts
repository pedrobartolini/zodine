import * as Errors from "./errors";
import * as ResponseSchema from "./response";
import * as Types from "./types";
import * as Utils from "./utils";
import * as Validation from "./validation";

export function create<TSchema extends Types.RequestSchema, TError = string>(
  host: string,
  schema: TSchema,
  defaultToaster: Types.ToasterCallback<TError>,
  autoToast: boolean,
  defaultHeaders: Record<string, string> | undefined,
  errorHandler: (response: Response) => Promise<TError>
): Types.RequesterFunction<TSchema, TError> {
  const requester = async function (params: Types.CallSignature<TSchema>) {
    const promise = async (): Promise<
      Omit<
        Types.ApiResponse<
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
            return Errors.createMapperError(
              "Erro ao aplicar o mapper na resposta.",
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }

        return validatedData;
      } catch (error) {
        return Errors.createNetworkError(
          "Não foi possível completar a requisição.",
          error instanceof Error ? error : new Error(String(error))
        );
      }
    };

    const result = (await promise()) as Types.ApiResponse<
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
  return requester as Types.RequesterFunction<TSchema, TError>;
}
