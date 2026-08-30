"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Lightweight data-fetching hook with manual refetch.
 * Includes a timeout so requests never hang indefinitely (PRD §3.5 sandbox resilience).
 */
export function useFetch<T>(url: string | null, options?: { skip?: boolean }) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    // 8-second timeout — never hang forever even if server is down (PRD §3.5)
    const timeout = setTimeout(() => ac.abort(), 8000);
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(url, { signal: ac.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as T;
      setState({ data, loading: false, error: null });
    } catch (e) {
      clearTimeout(timeout);
      if ((e as Error).name === "AbortError") {
        // Could be our timeout or a navigation abort — treat as error if we have no data
        setState((s) => ({ data: s.data, loading: false, error: s.data ? null : "Request timed out. The server may be restarting — please retry." }));
        return;
      }
      setState({ data: null, loading: false, error: (e as Error).message });
    }
  }, [url]);

  useEffect(() => {
    if (options?.skip) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    refetch();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [refetch, options?.skip]);

  return {
    ...state,
    refetch,
    setData: (updater: T | ((prev: T | null) => T)) =>
      setState((s) => ({ ...s, data: typeof updater === "function" ? (updater as (p: T | null) => T)(s.data) : updater })),
  };
}

/** Convenience for POST/PATCH/DELETE — includes timeout. */
export async function apiRequest<T = unknown>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: options.method || "POST",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || `Request failed (${res.status})`, status: res.status };
    }
    return { ok: true, data: data as T, status: res.status };
  } catch (e) {
    const msg = (e as Error).name === "AbortError"
      ? "Request timed out — the server may be restarting. Please retry."
      : (e as Error).message;
    return { ok: false, error: msg, status: 0 };
  }
}
