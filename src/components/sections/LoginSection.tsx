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
  ArrowRight,
} from "@/components/icons";

/**
 * Sign-in screen — dark, calm, Intent-class.
 * A floating rounded card on a simple near-black ground. One square-dot SVG
 * pattern in the same neutral hue fades across the card for depth; the only
 * accent family is Trinity purple (#391463 shades, #9D7BFF for links/icons) —
 * never more than three colors on the screen. The form is the primary goal;
 * the right column carries three quiet platform truths.
 * The logo is the single-color Trinity triangle; the mark inherits its hue.
 */

const TRUTHS = [
  {
    icon: ClipboardCheck,
    title: "Audited by design",
    note: "Every change is attributed and reviewable — nothing happens in the dark.",
  },
  {
    icon: Users,
    title: "Private by default",
    note: "Roles keep sensitive member data inside your church.",
  },
  {
    icon: Calendar,
    title: "One calm system",
    note: "Members, services and media in a single record.",
  },
] as const;

const PATTERN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Crect x='8.5' y='8.5' width='5' height='5' rx='1.2' fill='white' fill-opacity='0.11'/%3E%3C/svg%3E";

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
      className="min-h-screen flex items-center justify-center px-3 sm:px-6 py-8 sm:py-12 bg-[#121212] text-foreground"
      style={{
        fontFamily: "var(--font-instrument), var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <a
        href="#login-email"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to the sign-in form
      </a>

      <section
        className="relative w-full max-w-[1040px] grid lg:grid-cols-2 bg-[#1b1b1b] border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_48px_120px_-48px_rgba(0,0,0,0.9)]"
        aria-label="Sign in to Teleios"
      >
        {/* Square-dot pattern — one hue, fading with depth */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `url("${PATTERN}")`,
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(780px 560px at 30% 0%, black 0%, transparent 76%)",
            WebkitMaskImage: "radial-gradient(780px 560px at 30% 0%, black 0%, transparent 76%)",
          }}
        />

        {/* Form — the primary goal */}
        <div className="relative flex flex-col px-6 sm:px-10 py-9 sm:py-11">
          <TeleiosLogo size={38} className="text-white" />
          <h1 className="mt-7 text-[26px] sm:text-[30px] font-medium tracking-[-0.01em] text-white">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Church administration, built for clarity.</p>

          <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-zinc-200">
                Email
              </Label>
              <div className="relative">
                <Icon
                  as={Mail}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
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
                  className="h-10 pl-9 rounded-lg text-zinc-100 border-white/[0.08] focus-visible:border-[#9D7BFF]/50 focus-visible:ring-[#9D7BFF]/25"
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

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-zinc-200">
                Password
              </Label>
              <div className="relative">
                <Icon
                  as={Lock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
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
                  className="h-10 pl-9 pr-11 rounded-lg text-zinc-100 border-white/[0.08] focus-visible:border-[#9D7BFF]/50 focus-visible:ring-[#9D7BFF]/25"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-white border border-white/[0.08] bg-gradient-to-b from-[#4b2f8a] to-[#391463] hover:from-[#573899] hover:to-[#41236f] shadow-[0_10px_28px_-14px_rgba(57,20,99,0.9)]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p role="status" aria-live="polite" className="min-h-4 text-xs text-zinc-500">
              {loading ? "Signing in…" : " "}
            </p>
          </form>

          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Demo office account —{" "}
            <code className="text-zinc-300">admin@grace.community</code> ·{" "}
            <code className="text-zinc-300">grace2026</code>
          </p>

          <div className="mt-auto pt-9 flex items-center justify-between text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} Teleios</p>
            <a
              href="/portal"
              className="inline-flex items-center gap-1.5 font-medium text-[#9D7BFF] hover:text-[#b49bff] transition-colors"
            >
              Member portal
              <Icon as={ArrowRight} boundingBox={false} size={13} />
            </a>
          </div>
        </div>

        {/* Brand — quiet truths, same restrained palette */}
        <div className="relative border-t lg:border-t-0 lg:border-l border-white/[0.06] px-6 sm:px-10 py-9 sm:py-11 flex flex-col justify-center">
          <div className="space-y-8 lg:space-y-9 max-w-[400px] mx-auto lg:mx-0 w-full">
            {TRUTHS.map(({ icon, title, note }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 text-[#9D7BFF]">
                  <Icon as={icon} boundingBox={false} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-white">{title}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-1">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
