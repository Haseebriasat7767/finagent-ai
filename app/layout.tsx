import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAgent AI — Receivables Command Center",
  description: "A clear, human-approved workflow for accounts receivable operations."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}