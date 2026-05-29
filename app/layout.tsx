import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Sure Hands — Trusted local services in Enugu",
  description:
    "Sure Hands connects you with verified, nearby artisans and domestic workers. Plumbers, electricians, cleaners, mechanics — vetted, geolocated, ready.",
  metadataBase: new URL("https://sure-hands.local"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-stone-50 font-sans antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
