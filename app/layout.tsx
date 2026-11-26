import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAgent AI — Smarter Receivables & Cash Flow",
  description: "Manage invoices, prioritize receivables and prepare payment follow-ups with FinAgent AI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}