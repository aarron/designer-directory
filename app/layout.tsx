import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Design Better Careers — Design Jobs & Talent Directory",
  description:
    "The career hub for 230,000+ design and tech professionals. Browse senior design talent or post your open role to reach the best designers.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://designbetter.careers"),
  openGraph: {
    title: "Design Better Careers",
    description:
      "Browse senior design talent or post your open role to reach 230,000+ design professionals.",
    siteName: "Design Better Careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Better Careers",
    description: "Senior design talent. Quality jobs. 230,000+ readers.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen bg-white text-brand-black font-body">
        <HeaderNav />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
