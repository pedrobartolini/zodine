import { useCallback, useEffect, useRef, useState } from "react";

import isEqual from "react-fast-compare";

import * as ResponseSchema from "./response";
import * as Types from "./types";

function hasAnyUndefined(obj: any): boolean {
  if (obj === undefined) return true;
  if (typeof obj !== "object" || obj === null) return false;
  for (const key in obj) {
    if (hasAnyUndefined(obj[key])) return true;
  }
  return false;
}

function useDeepCompareMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  if (!isEqual(value, ref.current)) ref.current = value;
  return ref.current;
}

function useDeepCompareCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: any[]
): T {
  const memoDeps = useDeepCompareMemo(deps);
  return useCallback(fn, memoDeps);
}

type RefreshFunction = (resetState: boolean) => Promise<void>;
type SetterFunction<T> = (newData: T) => void;

export type HookResponse<T extends Types.RequestSchema, TError = string> =
  | [
      ResponseSchema.InferResult<T["responseSchema"]>,
      null,
      false,
      RefreshFunction,
      SetterFunction<ResponseSchema.InferResult<T["responseSchema"]>>
    ]
  | [
      null,
      Types.Errors<TError>,
      false,
      RefreshFunction,
      SetterFunction<ResponseSchema.InferResult<T["responseSchema"]>>
    ]
  | [
      null,
      null,
      true,
      RefreshFunction,
      SetterFunction<ResponseSchema.InferResult<T["responseSchema"]>>
    ];

export function useHook<T extends Types.RequestSchema, TError = string>(
  requester: Types.RequesterFunction<T, TError>,
  callParams: Types.CallSignature<T>
): HookResponse<T, TError> {
  const [data, setData] = useState<ResponseSchema.InferResult<
    T["responseSchema"]
  > | null>(null);
  const [error, setError] = useState<Types.Errors<TError> | null>(null);
  const [loading, setLoading] = useState(true);

  const requestParams = useDeepCompareMemo({
    body: callParams.body,
    query: callParams.query,
    headers: callParams.headers,
    path: callParams.path
  });

  const mapperParams = useDeepCompareMemo(callParams.map);

  const fetchData = useDeepCompareCallback(async () => {
    if (!hasAnyUndefined(callParams)) {
      const result = await requester(callParams);
      if (result.status === "success") {
        setData(result.data);
        setError(null);
      } else {
        setData(null);
        setError(result);
      }
      setLoading(false);
    }
  }, [requester, requestParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data && mapperParams !== undefined) {
      const mapper = (requester as any).mapper as any;
      if (mapper) {
        setData((prevData) => {
          if (!prevData) return null;
          return mapper(prevData)(mapperParams);
        });
      }
    }
  }, [mapperParams]);

  const setter = useCallback(
    (nextData: ResponseSchema.InferResult<T["responseSchema"]>) => {
      if (mapperParams) {
        setData((requester as any).mapper(nextData)(mapperParams));
      } else {
        setData(nextData);
      }
    },
    [mapperParams]
  );

  async function refresh(resetState: boolean) {
    if (resetState) {
      setLoading(true);
      setData(null);
      setError(null);
    }

    await fetchData();
  }

  return [data, error, loading, refresh, setter] as HookResponse<T, TError>;
}
