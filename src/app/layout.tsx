export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Providers from "@/components/layout/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Somma Mind — Heal. Transform. Thrive.",
  description:
    "A unique blend of hypnotherapy, brainspotting, and somatic healing designed to help you release deep-seated patterns and create lasting transformation.",
  keywords: ["hypnotherapy", "brainspotting", "somatic healing", "transformation", "mindfulness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#e9d8b6] text-[#1c1917] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
