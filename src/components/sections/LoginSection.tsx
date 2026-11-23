"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { TeleiosLogo } from "@/components/TeleiosLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
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
 * Sign-in screen — Teleios light scope, full-viewport split layout.
 * The brand panel carries a deep Trinity-purple gradient (no floating orbs)
 * and the three platform features as vertical gradient cards, each tinted
 * with one of the accent hues (FF5714 / 16DB65 / 9D7BFF) like portfolio
 * project cards. The right column is the clear sign-in form — the primary
 * goal of the screen; nothing decorative competes with it.
 * The .teleios-light wrapper in globals.css flips the app's dark tokens to
 * the dealt light palette for pre-auth screens only.
 */

const PROMISES = [
  "Every change attributed and audited",
  "Roles keep sensitive data private",
  "Your data stays within your church",
] as const;

const FEATURES = [
  {
    icon: Calendar,
    title: "Sunday service",
    note: "Attendance recorded in one tap",
    tint: "rgba(255,87,20,0.30)",
    tintSoft: "rgba(255,87,20,0.06)",
  },
  {
    icon: Users,
    title: "Members & households",
    note: "One audited record per person",
    tint: "rgba(22,219,101,0.24)",
    tintSoft: "rgba(22,219,101,0.05)",
  },
  {
    icon: ClipboardCheck,
    title: "Media submissions",
    note: "Review, approve and track",
    tint: "rgba(157,123,255,0.30)",
    tintSoft: "rgba(157,123,255,0.07)",
  },
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
      className="teleios-light text-foreground grid lg:grid-cols-[0.95fr_1fr] lg:h-screen lg:min-h-[640px] min-h-screen"
      style={{ background: "linear-gradient(180deg, #edf2f4 0%, #f7f9fa 100%)" }}
    >
      <a href="#login-email" className="tl-skip">
        Skip to the sign-in form
      </a>

      {/* Brand panel — Trinity-purple gradient, three feature cards */}
      <div
        className="t-enter relative overflow-hidden text-white flex flex-col px-5 sm:px-9 xl:px-12 py-7 sm:py-9 lg:h-full"
        style={{
          background:
            "linear-gradient(155deg, #170733 0%, #260b45 42%, #391463 82%, #451b78 100%)",
        }}
      >
        {/* Seamless glows only — no floating orbs */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(620px 460px at 92% -8%, rgba(255,87,20,0.14) 0%, rgba(255,87,20,0) 62%), radial-gradient(560px 480px at -10% 42%, rgba(22,219,101,0.10) 0%, rgba(22,219,101,0) 60%), radial-gradient(640px 520px at 64% 112%, rgba(157,123,255,0.16) 0%, rgba(157,123,255,0) 64%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <TeleiosLogo size={34} variant="mono" />
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-tight">Teleios</p>
            <p className="text-xs text-white/70 leading-tight mt-0.5">
              Church administration platform
            </p>
          </div>
        </div>

        {/* Promise */}
        <div className="relative mt-8 lg:mt-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
            Teleios office
          </p>
          <h1 className="mt-2 text-[clamp(24px,3.2vw,34px)] font-medium leading-[1.15] text-white">
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

        {/* Feature cards — one per accent hue */}
        <div className="relative flex-1 grid grid-cols-3 gap-2.5 sm:gap-3.5 mt-8 lg:mt-auto lg:pt-10 items-stretch">
          {FEATURES.map(({ icon, title, note, tint, tintSoft }) => (
            <div
              key={title}
              className="rounded-xl border border-white/15 flex flex-col overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${tint} 0%, ${tintSoft} 55%, rgba(23,7,51,0.35) 100%)`,
              }}
            >
              <div className="flex-1 flex items-center justify-center py-5 sm:py-7">
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/12 border border-white/20 flex items-center justify-center">
                  <Icon as={icon} boundingBox={false} size={20} />
                </span>
              </div>
              <div className="px-3 sm:px-4 pb-3.5 sm:pb-4">
                <p className="text-[13px] sm:text-sm font-medium leading-snug">{title}</p>
                <p className="hidden sm:block text-xs text-white/75 leading-snug mt-1">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel — the primary goal */}
      <div className="t-enter-2 relative flex flex-col bg-card px-5 sm:px-10 lg:px-12 xl:px-16 py-6 sm:py-8 lg:h-full lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <TeleiosLogo size={28} variant="accent" />
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
    </div>
  );
}
