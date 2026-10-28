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
  title: "Rumbela English Quest - Belajar Bahasa Inggris Jadi Seru!",
  description: "Game belajar Bahasa Inggris interaktif untuk bimbel Rumbela. Quiz, Word Match, Fill the Blank, dan Spell Master dengan mascot Bela.",
  keywords: ["Rumbela", "Bimbel Rumbela", "Belajar Bahasa Inggris", "Game Edukasi", "English Quest", "Rumah belajar Anak"],
  authors: [{ name: "Rumbela - Rumah belajar Anak" }],
  icons: {
    icon: "/rumbela/mascot-base.png",
    shortcut: "/rumbela/mascot-base.png",
    apple: "/rumbela/mascot-base.png",
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
        className={`${nunito.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-nunito), "Nunito", system-ui, sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
