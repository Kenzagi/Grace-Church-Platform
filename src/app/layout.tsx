import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Sans, DM_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// Geist carries the system (16px body regular / 14px medium-dense / 18px titles).
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Dealt pairing "instrument" (taste-skill 2.5) — the pre-auth screens' faces.
// Instrument Sans has a wght axis 400–700 (+ wdth 75–100, unused here); DM Mono
// carries credential codes on the sign-in screen.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teleios — Church Administration Platform",
  description:
    "Teleios keeps your church's member records, households, ministry groups, attendance, events and sermons in one audited system of record.",
  keywords: [
    "Teleios",
    "Church Administration",
    "Member Management",
    "Attendance",
    "Ministry",
  ],
  authors: [{ name: "Teleios" }],
  openGraph: {
    title: "Teleios — Church Administration Platform",
    description:
      "Member records, attendance, events and sermons in one audited system of record.",
    siteName: "Teleios",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary",
    title: "Teleios — Church Administration Platform",
    description:
      "Member records, attendance, events and sermons in one audited system of record.",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${instrument.variable} ${dmMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
