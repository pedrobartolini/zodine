import { z } from "zod";

import * as Errors from "./errors";
import * as ResponseSchema from "./response";
import { Language, t } from "./translations";
import * as Types from "./types";

function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  errorMessage: string
): [T | null, Types.ValidationError | null] {
  try {
    return [schema.parse(value), null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return [null, Errors.createValidationError(errorMessage, error)];
    }
    throw error;
  }
}

type ValidationResult<T> = [T, null] | [null, Types.ValidationError];

export function validateInputParams<T extends Types.RequestSchema>(
  schema: T,
  params: Types.RequesterParams<T>,
  language: Language = "en"
): ValidationResult<Types.RequesterParams<T>> {
  const translations = t(language);
  const next = { ...params };

  if (schema.bodySchema && params.body) {
    const [parsed, error] = validateWithSchema(
      schema.bodySchema,
      params.body,
      translations.validation.invalidRequestBody
    );
    if (error) return [null, error];
    next.body = parsed;
  }
  if (schema.formDataSchema && params.formData) {
    const [parsed, error] = validateWithSchema(
      schema.formDataSchema,
      params.formData,
      translations.validation.invalidFormData
    );
    if (error) return [null, error];
    next.formData = parsed;
  }
  if (schema.querySchema && params.query) {
    const [parsed, error] = validateWithSchema(
      schema.querySchema,
      params.query,
      translations.validation.invalidQueryParameters
    );
    if (error) return [null, error];
    next.query = parsed;
  }
  if (schema.headersSchema && params.headers) {
    const [parsed, error] = validateWithSchema(
      schema.headersSchema,
      params.headers,
      translations.validation.invalidHeaders
    );
    if (error) return [null, error];
    next.headers = parsed;
  }
  if (schema.pathSchema && params.path) {
    const [parsed, error] = validateWithSchema(
      schema.pathSchema,
      params.path,
      translations.validation.invalidUrlParameters
    );
    if (error) return [null, error];
    next.path = parsed;
  }

  return [next, null];
}

export function validateResponseData<T extends Types.RequestSchema>(
  schema: T,
  data: unknown,
  mapperParam?: ResponseSchema.InferMapperArg<T>,
  language: Language = "en"
):
  | Types.Success<ResponseSchema.InferResult<T["responseSchema"]>>
  | Types.ValidationError {
  const translations = t(language);
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
        translations.validation.invalidResponse,
        error
      );
    }
    throw error;
  }
}
