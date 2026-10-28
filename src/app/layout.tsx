import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rumbela English Quest - Belajar Bahasa Inggris Jadi Seru!",
  description: "Game belajar Bahasa Inggris interaktif untuk bimbel Rumbela. Quiz, Word Match, Fill the Blank, dan Spell Master dengan mascot Bela.",
  keywords: ["Rumbela", "Bimbel Rumbela", "Belajar Bahasa Inggris", "Game Edukasi", "English Quest", "Rumah belajar Anak"],
  authors: [{ name: "Rumbela - Rumah belajar Anak" }],
  icons: {
    icon: "/rumbela/mascot-bela.png",
    shortcut: "/rumbela/mascot-bela.png",
    apple: "/rumbela/mascot-bela.png",
  },
  openGraph: {
    title: "Rumbela English Quest",
    description: "Belajar Bahasa Inggris jadi seru bareng Bela!",
    siteName: "Rumbela",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumbela English Quest",
    description: "Belajar Bahasa Inggris jadi seru bareng Bela!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
