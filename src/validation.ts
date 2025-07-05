import { z } from "zod";

import * as Errors from "./errors";
import * as ResponseSchema from "./response";
import * as Types from "./types";

function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  errorMessage: string
): [T | null, Types.ValidationError | null] {
  try {
    schema.parse(value);
    return [value as T, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return [null, Errors.createValidationError(errorMessage, error)];
    }
    throw error;
  }
}

type ValidationResult<T extends Types.RequestSchema> =
  | [Types.RequesterParams<T>, null]
  | [null, Types.ValidationError];

export function validateInputParams<T extends Types.RequestSchema>(
  schema: T,
  params: Types.RequesterParams<T>
): ValidationResult<T> {
  if (schema.bodySchema && params.body) {
    const [parsed, error] = validateWithSchema(
      schema.bodySchema,
      params.body,
      "Invalid request body"
    );
    if (error) return [null, error];
    params.body = parsed;
  }
  if (schema.formDataSchema && params.formData) {
    const [parsed, error] = validateWithSchema(
      schema.formDataSchema,
      params.formData,
      "Invalid form data"
    );
    if (error) return [null, error];
    params.formData = parsed;
  }
  if (schema.querySchema && params.query) {
    const [parsed, error] = validateWithSchema(
      schema.querySchema,
      params.query,
      "Invalid query parameters"
    );
    if (error) return [null, error];
    params.query = parsed;
  }
  if (schema.headersSchema && params.headers) {
    const [parsed, error] = validateWithSchema(
      schema.headersSchema,
      params.headers,
      "Invalid headers"
    );
    if (error) return [null, error];
    params.headers = parsed;
  }
  if (schema.pathSchema && params.path) {
    const [parsed, error] = validateWithSchema(
      schema.pathSchema,
      params.path,
      "Invalid URL parameters"
    );
    if (error) return [null, error];
    params.path = parsed;
  }
  return [params, null];
}

export function validateResponseData<T extends Types.RequestSchema>(
  schema: T,
  data: unknown,
  mapperParam?: ResponseSchema.InferMapperArg<T>
):
  | Types.Success<ResponseSchema.InferResult<T["responseSchema"]>>
  | Types.ValidationError {
  try {
    const parsedData = schema.responseSchema.schema.parse(data);
    const finalData = schema.responseSchema.mapper
      ? (schema.responseSchema.mapper as any)(parsedData)(mapperParam)
      : parsedData;
    return Errors.createSuccess(
      finalData as ResponseSchema.InferResult<T["responseSchema"]>
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Errors.createValidationError(
        "Não foi possível validar a resposta.",
        error
      );
    }
    throw error;
  }
}
