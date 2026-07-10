import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestore.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LuxeStore | Premium Online Shopping',
    template: '%s | LuxeStore',
  },
  description: 'Discover curated luxury goods, high-end electronics, and premium fashion at LuxeStore. Shop online with fast delivery, easy returns, and secure payment.',
  keywords: [
    'online store', 'luxury goods', 'premium electronics', 'fashion', 'buy online',
    'ecommerce', 'LuxeStore', 'shopping', 'home living', 'sports', 'groceries'
  ],
  authors: [{ name: 'LuxeStore' }],
  creator: 'LuxeStore',
  publisher: 'LuxeStore',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'LuxeStore',
    title: 'LuxeStore | Premium Online Shopping',
    description: 'Discover curated luxury goods, high-end electronics, and premium fashion. Shop with fast delivery and secure payment.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'LuxeStore — Premium Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeStore | Premium Online Shopping',
    description: 'Curated luxury goods, electronics, and fashion. Fast delivery. Secure payment.',
    images: [`${siteUrl}/og-image.png`],
  },
  verification: {
    // Add your Google Search Console verification code here when you have it
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <meta name="theme-color" content="#0f172a" />
      </head>
      <body>{children}</body>
    </html>
  );
}
