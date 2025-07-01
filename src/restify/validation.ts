import { z } from "zod";

import { Success, ValidationError } from ".";
import * as RequestSchema from "./request";
import * as ResponseSchema from "./response";

function validateWithSchema<T>(schema: z.ZodSchema<T>, value: unknown, errorMessage: string): [T | null, ValidationError | null] {
  try {
    schema.parse(value);
    return [value as T, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return [null, { ok: false, code: 400, status: "validation_error", message: errorMessage, errors: error }];
    }
    throw error;
  }
}

export function validateInputParams<T extends RequestSchema.RequestSchema>(schema: T, params: RequestSchema.RequesterParams<T>): ValidationError | null {
  if (schema.bodySchema && params.body) {
    const [parsed, error] = validateWithSchema(schema.bodySchema, params.body, "Invalid request body");
    if (error) return error;
    params.body = parsed;
  }
  if (schema.formDataSchema && params.formData) {
    const [parsed, error] = validateWithSchema(schema.formDataSchema, params.formData, "Invalid form data");
    if (error) return error;
    params.formData = parsed;
  }
  if (schema.querySchema && params.query) {
    const [parsed, error] = validateWithSchema(schema.querySchema, params.query, "Invalid query parameters");
    if (error) return error;
    params.query = parsed;
  }
  if (schema.headersSchema && params.headers) {
    const [parsed, error] = validateWithSchema(schema.headersSchema, params.headers, "Invalid headers");
    if (error) return error;
    params.headers = parsed;
  }
  if (schema.pathSchema && params.path) {
    const [parsed, error] = validateWithSchema(schema.pathSchema, params.path, "Invalid URL parameters");
    if (error) return error;
    params.path = parsed;
  }
  return null;
}

export function validateResponseData<T extends RequestSchema.RequestSchema>(
  schema: T,
  data: unknown,
  mapperParam?: ResponseSchema.InferMapperArg<T>,
): Success<ResponseSchema.InferResult<T["responseSchema"]>> | ValidationError {
  try {
    const parsedData = schema.responseSchema.schema.parse(data);
    const finalData = schema.responseSchema.mapper ? (schema.responseSchema.mapper as any)(parsedData)(mapperParam) : parsedData;
    return {
      ok: true,
      status: "success",
      data: finalData as ResponseSchema.InferResult<T["responseSchema"]>,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        code: 400,
        status: "validation_error",
        message: "Não foi possível validar a resposta.",
        errors: error,
      };
    }
    throw error;
  }
}
