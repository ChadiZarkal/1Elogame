import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flag Games - Red Flag & More",
  description: "Red Flag, Green Flag… Choisis ton jeu et amuse-toi entre amis ! Party games mobiles, sans compte, instantanés.",
  keywords: ["jeu", "party game", "red flag", "green flag", "débat", "amis", "IA"],
  authors: [{ name: "Flag Games" }],
  openGraph: {
    title: "Flag Games - Red Flag & More",
    description: "Red Flag, Green Flag… Choisis ton jeu préféré !",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0D",
};

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} antialiased min-h-full`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
