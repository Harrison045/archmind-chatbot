import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ArchmindChatProvider } from "@/lib/use-archmind-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArchMind — Architectural Intelligence",
  description:
    "An AI assistant purpose-built for architecture, building design, and the built environment. Reason through design decisions with rigour — and clear safety limits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground">
        <ArchmindChatProvider>{children}</ArchmindChatProvider>
      </body>
    </html>
  );
}
