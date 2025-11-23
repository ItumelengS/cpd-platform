import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import AdBlockerDetect from "@/components/AdBlockerDetect";
import CookieConsent from "@/components/CookieConsent";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RadSciCPD - Affordable CPD for Healthcare Professionals",
    template: "%s | RadSciCPD"
  },
  description: "Complete your annual CPD requirements for less than R5,000/year. Professional development courses for radiologists, radiographers, and healthcare professionals in South Africa.",
  keywords: ["CPD", "Continuous Professional Development", "Healthcare", "Radiology", "Radiography", "Medical Education", "South Africa", "HPCSA"],
  authors: [{ name: "RadSciCPD" }],
  creator: "RadSciCPD",
  publisher: "RadSciCPD",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://radscicpd.com",
    siteName: "RadSciCPD",
    title: "RadSciCPD - Affordable CPD for Healthcare Professionals",
    description: "Complete your annual CPD requirements for less than R5,000/year",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RadSciCPD Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RadSciCPD - Affordable CPD for Healthcare Professionals",
    description: "Complete your annual CPD requirements for less than R5,000/year",
    images: ["/og-image.jpg"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="en">
      <head>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <AdBlockerDetect />
        <CookieConsent />
      </body>
    </html>
  );
}
