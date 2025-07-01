import { z } from "zod";

export type ResponseSchema<TSchema extends z.ZodSchema, TArg, TResult> = {
  schema: TSchema;
  mapper?: MapperCallback<TSchema, TArg, TResult>;
};

export type InferResult<T> = T extends ResponseSchema<infer TSchema, any, infer TResult> ? (TResult extends undefined ? z.infer<TSchema> : TResult) : never;

export type InferMapperArg<T> = T extends ResponseSchema<any, infer TArg, any> ? TArg : never;
export type InferMapper<T> =
  T extends ResponseSchema<infer TSchema, infer TArg, infer TResult> ? (data: z.infer<TSchema>) => (arg: MapperCallbackArg<TArg>) => TResult : undefined;

type MapperCallbackArg<T> = T extends Record<string, any> ? T : undefined;
type MapperCallback<T extends z.ZodSchema, TArg, TResult> = (data: z.infer<T>) => (arg: MapperCallbackArg<TArg>) => TResult;

export function create<T extends z.ZodSchema, TArg, TResult>(schema: T): ResponseSchema<T, undefined, undefined>;
export function create<T extends z.ZodSchema, TArg, TResult>(schema: T, mapper: MapperCallback<T, {}, TResult>): ResponseSchema<T, undefined, TResult>;
export function create<T extends z.ZodSchema, TArg, TResult>(schema: T, mapper: MapperCallback<T, undefined, TResult>): ResponseSchema<T, undefined, TResult>;
export function create<T extends z.ZodSchema, TArg, TResult>(schema: T, mapper: MapperCallback<T, TArg, TResult>): ResponseSchema<T, TArg, TResult>;
export function create<T extends z.ZodSchema, TArg, TResult>(schema: T, mapper?: MapperCallback<T, TArg, TResult>): ResponseSchema<T, TArg, TResult> {
  return { schema, mapper };
}
