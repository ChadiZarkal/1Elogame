import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Red or Green - Le jeu des Red Flags",
  description: "Entre deux choix, lequel est le plus gros Red Flag ? Découvre ce que pensent les autres !",
  keywords: ["jeu", "party game", "red flag", "débat", "amis"],
  authors: [{ name: "Red or Green Game" }],
  openGraph: {
    title: "Red or Green - Le jeu des Red Flags",
    description: "Entre deux choix, lequel est le plus gros Red Flag ?",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} antialiased min-h-full`}>
        {children}
      </body>
    </html>
  );
}
