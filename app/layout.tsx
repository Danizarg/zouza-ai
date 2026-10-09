import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SuziAvatarAssistant } from "@/components/suzi/suzi-avatar-assistant";
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
    default: "Zouza — Your AI Real Estate Partner",
    template: "%s · Zouza",
  },
  description:
    "Explore example properties, compare listing details, or draft a property listing with Zouza.",
  openGraph: {
    title: "Zouza — Your AI Real Estate Partner",
    description:
      "Explore example properties, compare listing details, or draft a property listing with Zouza.",
    url: appUrl,
    siteName: "Zouza",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zouza — Your AI Real Estate Partner",
    description: "Explore example properties or draft a property listing with Zouza.",
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
        <SuziAvatarAssistant />
      </body>
    </html>
  );
}
