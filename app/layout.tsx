import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AdSlot } from "@/components/ads/AdSlot";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathvibe.net"),
  title: "MathVibe — Smart Math Tools & Calculators",
  description: "Fast, accessible, and step-by-step mathematical solutions.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geist.className}>
      <body suppressHydrationWarning className="flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="absolute left-4 top-4 z-50 -translate-y-24 rounded-lg bg-cyan px-3 py-2 text-sm font-semibold text-midnight focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
            <AdSlot placement="leaderboard" />
          </div>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
