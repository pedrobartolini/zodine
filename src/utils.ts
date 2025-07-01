import * as Errors from "./errors";
import * as Types from "./types";

export function buildUrl<T extends Types.RequestSchema>(
  host: string,
  schema: T,
  params: Types.RequesterParams<T>
): string {
  let url = schema.endpoint;
  if (schema.pathSchema && params.path) {
    for (const [key, value] of Object.entries(
      params.path as Record<string, string>
    )) {
      url = url.replace(`:${key}`, encodeURIComponent(String(value)));
    }
  }
  const queryString = params.query
    ? `?${new URLSearchParams(
        params.query as Record<string, string>
      ).toString()}`
    : "";
  return `${host}${url}${queryString}`;
}

export async function executeRequest<T extends Types.RequestSchema>(
  url: string,
  schema: T,
  params: Types.RequesterParams<T>,
  defaultHeaders?: Record<string, string>
): Promise<Response | Types.NetworkError> {
  const headers = new Headers({ ...defaultHeaders });
  if (schema.headersSchema && params.headers) {
    for (const [key, value] of Object.entries(
      params.headers as Record<string, string>
    )) {
      headers.append(key, String(value));
    }
  }

  let body;

  if (schema.formDataSchema && params.formData) {
    body = new FormData();

    for (const [key, value] of Object.entries(params.formData)) {
      if (value instanceof Array) {
        if (value.length !== 0 && value[0] instanceof File) {
          for (const item of value) {
            body.append(key, item);
          }
          continue;
        }
      }
      body.append(key, value);
    }
  } else if (schema.bodySchema && params.body) {
    body = JSON.stringify(params.body);
    headers.append("Content-Type", "application/json");
  }

  try {
    return await fetch(url, {
      method: schema.method,
      headers: headers,
      body: body,
    });
  } catch (error) {
    return Errors.createNetworkError(
      "Não foi possível completar a requisição.",
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

export async function handleErrorResponse<TError = string>(
  response: Response,
  errorHandler?: (response: Response) => Promise<TError>
): Promise<Types.CustomError<TError>> {
  let data: TError;
  let message: string;

  if (errorHandler) {
    try {
      data = await errorHandler(response);
      message = `API error ${response.status}: ${response.statusText}`;
    } catch (error) {
      data = `Failed to parse error response: ${error}` as TError;
      message = `API error ${response.status}: ${response.statusText}`;
    }
  } else {
    try {
      const errorText = await response.json();
      if (typeof errorText === "string") {
        data = errorText as TError;
        message = errorText;
      } else {
        throw new Error("Invalid error message format");
      }
    } catch {
      data = `API error ${response.status}: ${response.statusText}` as TError;
      message = `API error ${response.status}: ${response.statusText}`;
    }
  }

  return Errors.createCustomError(message, data, response.status);
}
