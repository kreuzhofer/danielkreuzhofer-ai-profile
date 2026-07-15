import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Anton } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";
import { ChatWrapper } from "@/components/chat/ChatWrapper";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

// Nonce-based CSP (middleware.ts, VULN-003) requires every HTML page to be
// dynamically rendered: Next.js injects the per-request nonce into its script
// tags only during request-time rendering. Statically prerendered pages ship
// nonce-less script tags, which 'strict-dynamic' blocks entirely (broken
// hydration site-wide). Do not remove without also removing the nonce CSP.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daniel Kreuzhofer - Cloud. AI. Clarity.",
  description: "Senior AI Solutions Architect helping companies leverage Cloud and AI with substance, not hype. 20+ years of experience in enterprise architecture, migrations, and GenAI implementation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} ${anton.variable} antialiased font-sans`}
      >
        <ChatProvider>
          {children}
          <Footer />
          <ChatWrapper />
        </ChatProvider>
      </body>
    </html>
  );
}
