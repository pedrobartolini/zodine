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

export type RefreshFunction = (resetState?: boolean) => Promise<boolean>;
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
  callParams: Types.CallSignature<T> & { lazy?: boolean }
): HookResponse<T, TError> {
  const [unmappedData, setUnmappedData] = useState(null);

  const [mappedData, setMappedData] = useState(null);
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
      const result = await requester(callParams, true);
      if (result.status === "success") {
        setUnmappedData(result.data);

        const mapper = (requester as any).mapper as any;
        if (mapper) {
          setMappedData(mapper(result.data)(mapperParams));
        } else {
          setMappedData(result.data);
        }

        setError(null);
      } else {
        setUnmappedData(null);
        setMappedData(null);
        setError(result);
      }
      setLoading(false);

      return result.ok;
    }

    return true;
  }, [requester, requestParams]);

  useEffect(() => {
    // Only fetch data automatically if not in lazy mode
    if (!callParams.lazy) {
      fetchData();
    } else if (loading) {
      // If in lazy mode, just set loading to false without fetching
      // setLoading(false); // < --- dont do this, this corrupts the union integrity
    }
  }, [fetchData, callParams.lazy]);

  useEffect(() => {
    if (unmappedData) {
      const mapper = (requester as any).mapper as any;
      if (mapper) {
        setMappedData(mapper(unmappedData)(mapperParams));
      } else {
        setMappedData(unmappedData);
      }
    }
  }, [mapperParams]);

  const setter = useCallback(
    (nextData: ResponseSchema.InferResult<T["responseSchema"]>) => {
      const mapper = (requester as any).mapper as any;
      if (mapper) {
        setMappedData(mapper(nextData)(mapperParams));
      } else {
        setMappedData(nextData);
      }
    },
    [mapperParams]
  );

  async function refresh(resetState?: boolean): Promise<boolean> {
    if (resetState) {
      setLoading(true);
      setUnmappedData(null);
      setError(null);
    }

    return await fetchData();
  }

  return [mappedData, error, loading, refresh, setter] as HookResponse<
    T,
    TError
  >;
}
