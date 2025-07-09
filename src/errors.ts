import { z } from "zod";
import * as Types from "./types";

/**
 * Creates a success response
 */
export function createSuccess<T>(data: T): Types.Success<T> {
  return { ok: true, status: "success", data };
}

/**
 * Creates a validation error response
 */
export function createValidationError(
  message: string,
  error: z.ZodError,
  code: number = 400
): Types.ValidationError {
  return {
    ok: false,
    code,
    status: "validation_error",
    message,
    error
  };
}

/**
 * Creates a network error response
 */
export function createNetworkError(
  message: string,
  error: Error,
  code: number = 500
): Types.NetworkError {
  return {
    ok: false,
    code,
    status: "network_error",
    message,
    error
  };
}

/**
 * Creates a custom API error response
 */
export function createCustomError<T = string>(
  message: string,
  data: T,
  code: number
): Types.CustomError<T> {
  return {
    ok: false,
    code,
    status: "api_error",
    message,
    data
  };
}

/**
 * Creates a mapper error response
 */
export function createMapperError(
  message: string,
  error: Error,
  code: number = 500
): Types.MapperError {
  return {
    ok: false,
    code,
    status: "mapper_error",
    message,
    error
  };
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(
  response: Types.ApiResponse<T, any>
): response is Types.Success<T> & { toast: () => void } {
  return response.ok === true;
}

/**
 * Type guard to check if response is an error
 */
export function isError<T>(
  response: Types.ApiResponse<any, T>
): response is Types.Errors<T> & { toast: () => void } {
  return response.ok === false;
}
