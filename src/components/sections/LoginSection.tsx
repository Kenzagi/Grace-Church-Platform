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
  Check,
  ArrowRight,
} from "@/components/icons";

/**
 * Sign-in screen — Teleios light scope, split-card layout.
 * Reference pattern (Supabase / Neon / Orion class): one floating rounded card
 * on a soft page ground; brand panel (gradient + frosted product-snapshot
 * chips) on the left, the clear sign-in form on the right. The form stays the
 * primary goal — no decorative dead controls.
 * The .teleios-light wrapper in globals.css flips the app's dark tokens to the
 * dealt light palette for pre-auth screens only.
 */

const PROMISES = [
  "Every change attributed and audited",
  "Roles keep sensitive data private",
  "Your data stays within your church",
] as const;

const SNAPSHOT = [
  { icon: Calendar, title: "Sunday service", note: "Attendance recorded in one tap", tilt: "lg:-rotate-2" },
  { icon: Users, title: "Members & households", note: "One audited record per person", tilt: "lg:rotate-[1.5deg]" },
  { icon: ClipboardCheck, title: "Media submissions", note: "Review, approve and track", tilt: "lg:-rotate-1" },
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
    <div
      className="teleios-light min-h-screen flex flex-col text-foreground"
      style={{ background: "linear-gradient(180deg, #edf3f4 0%, #f7f9fa 55%, #f2f6f7 100%)" }}
    >
      <a href="#login-email" className="tl-skip">
        Skip to the sign-in form
      </a>

      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <section
          className="t-enter w-full max-w-[1120px] grid lg:grid-cols-[0.95fr_1fr] bg-card border border-border rounded-[24px] overflow-hidden shadow-[0_32px_80px_-32px_rgba(15,58,66,0.35)]"
          aria-label="Sign in to Teleios"
        >
          {/* Brand panel — teal gradient with a seamless product snapshot */}
          <div
            className="t-enter-2 relative overflow-hidden text-white flex flex-col px-6 sm:px-9 py-7 sm:py-9 min-h-[300px] sm:min-h-[380px] lg:min-h-[620px]"
            style={{
              background:
                "linear-gradient(160deg, #06333b 0%, #0a4a52 42%, #0d7480 78%, #14919b 100%)",
            }}
          >
            {/* Seamless glows and soft geometry — the "snapshot" atmosphere */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(560px 420px at 88% -6%, rgba(20,145,155,0.55) 0%, rgba(20,145,155,0) 60%), radial-gradient(480px 380px at -8% 30%, rgba(64,200,201,0.28) 0%, rgba(64,200,201,0) 62%), radial-gradient(520px 460px at 70% 108%, rgba(3,26,31,0.55) 0%, rgba(3,26,31,0) 64%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -top-24 -right-20 w-[340px] h-[340px] rounded-full pointer-events-none border border-white/15"
              style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0) 68%)" }}
            />
            <div
              aria-hidden
              className="absolute top-24 -left-24 w-[280px] h-[280px] rounded-full pointer-events-none border border-white/10"
              style={{ background: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08), rgba(255,255,255,0) 70%)" }}
            />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-white/12 border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Icon as={Church} boundingBox={false} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-tight">Teleios</p>
                <p className="text-xs text-white/70 leading-tight mt-0.5">
                  Church administration platform
                </p>
              </div>
            </div>

            {/* Frosted product-snapshot chips */}
            <div className="relative flex-1 flex flex-col justify-center gap-3 sm:gap-4 py-8">
              {SNAPSHOT.map(({ icon, title, note, tilt }, i) => (
                <div
                  key={title}
                  className={`w-full max-w-[300px] rounded-xl border border-white/18 bg-white/10 backdrop-blur-md px-4 py-3 flex items-center gap-3 shadow-[0_12px_32px_-16px_rgba(3,26,31,0.6)] ${tilt} ${
                    i === 1 ? "lg:ml-auto" : i === 2 ? "lg:ml-6" : ""
                  }`}
                >
                  <span className="w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <Icon as={icon} boundingBox={false} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-snug">{title}</span>
                    <span className="block text-xs text-white/70 leading-snug mt-0.5">{note}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Promise */}
            <div className="relative">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                Teleios office
              </p>
              <h1 className="mt-2 text-[clamp(24px,3.4vw,34px)] font-medium leading-[1.15] text-white">
                Church administration, in one calm place.
              </h1>
              <ul className="mt-5 space-y-2.5" aria-label="Why teams trust Teleios">
                {PROMISES.map((line) => (
                  <li key={line} className="flex items-center gap-2.5 text-[13px] text-white/85">
                    <span className="w-5 h-5 rounded-full bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon as={Check} boundingBox={false} size={12} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel — the primary goal */}
          <div className="t-enter relative flex flex-col px-5 sm:px-10 lg:px-12 py-7 sm:py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 lg:invisible">
                <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Icon as={Church} boundingBox={false} size={18} />
                </div>
                <p className="text-sm font-medium">Teleios</p>
              </div>
              <a
                href="/portal"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium underline-offset-2"
              >
                Member portal
                <Icon as={ArrowRight} boundingBox={false} size={14} />
              </a>
            </div>

            <div className="flex-1 flex items-center py-8">
              <div className="w-full max-w-[400px] mx-auto">
                <h2 className="text-[clamp(24px,2.6vw,30px)] font-medium tracking-[-0.01em]">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Sign in to your Teleios office account.
                </p>

                <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4">
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

                <div className="mt-5 rounded-md bg-surface-alt border border-border px-4 py-3">
                  <p className="text-xs font-medium mb-1.5">Demo office account</p>
                  <p className="text-xs text-muted-foreground">
                    Email <code className="text-foreground">admin@grace.community</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Password <code className="text-foreground">grace2026</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Teleios</p>
              <p>Church administration platform</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
