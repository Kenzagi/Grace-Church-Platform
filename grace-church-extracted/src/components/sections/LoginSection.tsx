"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Church, Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export function LoginSection({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [email, setEmail] = React.useState("admin@grace.community");
  const [password, setPassword] = React.useState("grace2026");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await onLogin(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Login failed");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <header className="h-16 border-b border-border bg-surface flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
            <Icon as={Church} boundingBox={false} size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Grace Community Church</p>
            <p className="text-[11px] text-muted-foreground">Member Management Platform</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="hidden lg:block">
            <h1 className="text-4xl font-semibold tracking-tight text-primary leading-tight">
              One platform for your<br />whole congregation.
            </h1>
            <p className="text-base text-muted-foreground mt-6 max-w-md leading-relaxed">
              Member records, households, ministry groups, event calendar, attendance
              tracking, sermon archive, and event reminders — all in one audited system
              of record.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Centralized member directory with CSV import",
                "Attendance tracking with weekly trends",
                "Household grouping & volunteer scheduling",
                "Submission review queue for member media",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-md p-8 shadow-sm">
            <h2 className="text-title text-primary">Sign in to your account</h2>
            <p className="text-caption mt-1">Use your administrator credentials to continue.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email address</Label>
                <div className="relative">
                  <Icon as={Mail} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" boundingBox={false} size={16} />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="you@grace.community"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Icon as={Lock} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" boundingBox={false} size={16} />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 rounded-sm bg-surface-alt px-4 py-3 text-xs text-muted-foreground border border-border">
              <p className="font-medium text-foreground mb-1">Demo credentials</p>
              <p>Email: <code className="font-mono">admin@grace.community</code></p>
              <p>Password: <code className="font-mono">grace2026</code></p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface px-6 py-4">
        <p className="text-caption text-center">
          Grace Community Church · Member Management Platform v2.0 · {" "}
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}