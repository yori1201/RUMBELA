import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RUMBELA GAMES - Belajar Jadi Seru!",
  description: "Kumpulan game edukasi untuk bimbel Rumbela. Belajar Bahasa Inggris (Quiz, Word Match, Fill the Blank, Spell Master) dan Berhitung (Math Adventure) dengan mascot Bela.",
  keywords: ["Rumbela Games", "Rumbela", "Bimbel Rumbela", "Belajar Bahasa Inggris", "Game Berhitung", "Game Edukasi", "Rumah belajar Anak"],
  authors: [{ name: "Rumbela - Rumah belajar Anak" }],
  icons: {
    icon: "/rumbela/mascot-base.png",
    shortcut: "/rumbela/mascot-base.png",
    apple: "/rumbela/mascot-base.png",
  },
  openGraph: {
    title: "RUMBELA GAMES",
    description: "Belajar Bahasa Inggris & Berhitung jadi seru bareng Bela!",
    siteName: "Rumbela Games",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUMBELA GAMES",
    description: "Belajar Bahasa Inggris & Berhitung jadi seru bareng Bela!",
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
        className={`${nunito.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-nunito), "Nunito", system-ui, sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
