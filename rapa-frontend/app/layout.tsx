import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RAPA — Revocable Autonomous Payment Agents",
  description:
    "Create rule-based autonomous payment agents on Stellar that execute payments without repeated approval, enforced entirely by Soroban smart contracts.",
  keywords: [
    "Stellar",
    "Soroban",
    "DeFi",
    "autonomous payments",
    "smart contracts",
    "blockchain",
  ],
  openGraph: {
    title: "RAPA — Revocable Autonomous Payment Agents",
    description:
      "Non-custodial autonomous payment infrastructure on Stellar.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
