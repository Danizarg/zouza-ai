import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Zouza.ai — Professional Property Marketing. Powered by AI.",
    template: "%s · Zouza.ai",
  },
  description:
    "Upload photos. Zouza creates the listing. Verified homes, transparent prices and a dedicated AI assistant for every property. Spain first — global next.",
  openGraph: {
    title: "Zouza.ai — Professional Property Marketing. Powered by AI.",
    description:
      "Upload photos. Zouza creates the listing, exposé, FAQ, translations and a dedicated AI assistant for every property.",
    url: appUrl,
    siteName: "Zouza.ai",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zouza.ai — Professional Property Marketing. Powered by AI.",
    description: "Upload photos. Zouza creates the listing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
