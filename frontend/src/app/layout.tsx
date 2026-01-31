import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";
import { ChatWrapper } from "@/components/chat/ChatWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daniel Kreuzhofer - Cloud. AI. Clarity.",
  description: "Senior Solutions Architect helping companies leverage Cloud and AI with substance, not hype. 20+ years of experience in enterprise architecture, migrations, and GenAI implementation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ChatProvider>
          {children}
          <ChatWrapper />
        </ChatProvider>
      </body>
    </html>
  );
}
