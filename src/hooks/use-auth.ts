"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  serverDown: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setServerDown(false);
    // Retry up to 3 times with short backoff — sandbox may be restarting (PRD §3.5)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetchWithTimeout("/api/auth/me", {}, 6000);
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setServerDown(false);
        setLoading(false);
        return;
      } catch {
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        // All retries failed — server is unreachable
        setUser(null);
        setServerDown(true);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      setServerDown(false);
      // Retry up to 3 times — sandbox may restart mid-request (PRD §3.5)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetchWithTimeout(
            "/api/auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            },
            8000
          );
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { ok: false, error: data.error || "Login failed" };
          }
          const data = await res.json();
          setUser(data.user);
          setServerDown(false);
          return { ok: true };
        } catch (e) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
            continue;
          }
          setServerDown(true);
          return { ok: false, error: "Unable to reach the server. Please retry." };
        }
      }
      return { ok: false, error: "Login failed" };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetchWithTimeout("/api/auth/logout", { method: "POST" }, 5000);
    } catch {
      // ignore — we clear local state regardless
    }
    setUser(null);
  }, []);

  return { user, loading, serverDown, login, logout, refresh };
}
