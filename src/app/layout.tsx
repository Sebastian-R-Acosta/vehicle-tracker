import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { LanguageSync } from "@/components/LanguageSync";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Bitácora — Vehicle History & Maintenance Platform",
    template: "%s | Bitácora",
  },
  description:
    "Track vehicle maintenance, service history, and get smart reminders. Free for car owners. White-label for dealerships and insurers.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Bitácora — Vehicle History & Maintenance Platform",
    description:
      "Track vehicle maintenance, service history, and get smart reminders. Free for car owners. White-label for dealerships and insurers.",
    type: "website",
    siteName: "Bitácora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitácora",
    description:
      "Track vehicle maintenance, service history, and get smart reminders.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className={`${inter.className} bg-background min-h-screen`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none">
          Skip to main content
        </a>
        <Providers>
          <LanguageSync />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <div id="main-content">{children}</div>
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}