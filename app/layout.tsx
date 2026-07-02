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
    default: "Aurora Homes — Professional Property Marketing. Powered by AI.",
    template: "%s · Aurora Homes",
  },
  description:
    "Upload photos. Aurora creates the listing. Verified homes, transparent prices and a dedicated AI assistant for every property. Spain first — global next.",
  openGraph: {
    title: "Aurora Homes — Professional Property Marketing. Powered by AI.",
    description:
      "Upload photos. Aurora creates the listing, exposé, FAQ, translations and a dedicated AI assistant for every property.",
    url: appUrl,
    siteName: "Aurora Homes",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora Homes — Professional Property Marketing. Powered by AI.",
    description: "Upload photos. Aurora creates the listing.",
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
