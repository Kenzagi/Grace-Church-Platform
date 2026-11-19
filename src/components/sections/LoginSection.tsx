"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Church,
  Loader2,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ClipboardCheck,
  Users,
  Calendar,
} from "@/components/icons";

/**
 * Sign-in screen — Teleios light scope.
 * Dealt style (taste-skill 2.5): palette cool-white-slate, type instrument,
 * radius soft. The .teleios-light wrapper in globals.css flips the app's
 * dark tokens to the dealt light palette for pre-auth screens only.
 */

const JOBS = [
  { icon: ClipboardCheck, label: "Record attendance for services and events" },
  { icon: Users, label: "Manage member records and households" },
  { icon: Calendar, label: "Review upcoming events and sermons" },
] as const;

export function LoginSection({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [email, setEmail] = React.useState("admin@grace.community");
  const [password, setPassword] = React.useState("grace2026");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    const res = await onLogin(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setFormError(
        res.error === "Invalid credentials"
          ? "That email and password don't match an account. Check them and try again."
          : res.error || "Sign in failed. Check your connection and try again."
      );
    }
  }

  return (
    <div className="teleios-light min-h-screen flex flex-col bg-background text-foreground">
      <a href="#login-email" className="tl-skip">
        Skip to the sign-in form
      </a>
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 lg:py-14">
        <section className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center" aria-label="Sign in to Teleios">
          {/* Brand + promise — open on the ground, no card */}
          <div className="t-enter max-w-md mx-auto lg:mx-0 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Icon as={Church} boundingBox={false} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-tight">Teleios</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Church administration platform
                </p>
              </div>
            </div>

            <h1 className="mt-8 text-[clamp(30px,4.5vw,42px)] font-medium leading-[1.12]">
              Church administration, in one calm place.
            </h1>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              Teleios keeps your members, households, attendance, services and sermons
              in one audited system of record.
            </p>

            <ul className="mt-9 space-y-4" aria-label="What you can do from here">
              {JOBS.map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-8 h-8 rounded-md border border-border bg-surface flex items-center justify-center text-primary shrink-0">
                    <Icon as={icon} boundingBox={false} size={16} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Sign-in panel — the one card on the screen */}
          <div className="t-enter-2 bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
            <h2 className="text-lg font-medium tracking-[-0.01em]">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Use your Teleios office account.</p>

            <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email address</Label>
                <div className="relative">
                  <Icon
                    as={Mail}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    boundingBox={false}
                    size={16}
                  />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((f) => ({ ...f, email: undefined }));
                      }
                    }}
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                    disabled={loading}
                    className="h-11 pl-9"
                    placeholder="you@grace.community"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p id="login-email-error" className="text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Icon
                    as={Lock}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    boundingBox={false}
                    size={16}
                  />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((f) => ({ ...f, password: undefined }));
                      }
                    }}
                    required
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                    disabled={loading}
                    className="h-11 pl-9 pr-11"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors"
                  >
                    <Icon as={showPassword ? EyeOff : Eye} boundingBox={false} size={16} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="login-password-error" className="text-xs text-destructive">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p role="status" aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
                {loading ? "Signing in…" : " "}
              </p>
            </form>

            <div className="mt-6 rounded-md bg-surface-alt border border-border px-4 py-3">
              <p className="text-xs font-medium mb-1.5">Demo office account</p>
              <p className="text-xs text-muted-foreground">
                Email <code className="text-foreground">admin@grace.community</code>
              </p>
              <p className="text-xs text-muted-foreground">
                Password <code className="text-foreground">grace2026</code>
              </p>
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Member?{" "}
              <a href="/portal" className="text-primary hover:underline font-medium">
                Submit or track media in the portal
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Teleios</p>
        <p>Church administration platform</p>
      </footer>
    </div>
  );
}
