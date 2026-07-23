import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestorepay.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LuxeStorePay | Premium Online Shopping & Luxe Store',
    template: '%s | LuxeStorePay',
  },
  description: 'Discover curated luxury goods, high-end electronics, and premium fashion at LuxeStorePay (LuxeStore). Shop online with fast delivery, easy returns, and secure payment at luxestorepay.vercel.app.',
  keywords: [
    'luxe', 'luxestore', 'luxestore pay', 'luxestorepay', 'luxe store pay', 'luxe store',
    'luxestorepay.vercel.app', 'luxe pay', 'online store', 'luxury goods', 'premium electronics',
    'fashion', 'buy online', 'ecommerce', 'LuxeStore', 'LuxeStorePay', 'shopping', 'home living', 'sports'
  ],
  authors: [{ name: 'LuxeStorePay' }],
  creator: 'LuxeStorePay',
  publisher: 'LuxeStorePay',
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
    siteName: 'LuxeStorePay',
    title: 'LuxeStorePay | Premium Online Shopping & Luxe Store',
    description: 'Discover curated luxury goods, high-end electronics, and premium fashion at LuxeStorePay. Shop with fast delivery and secure payment.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'LuxeStorePay — Premium Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeStorePay | Premium Online Shopping & Luxe Store',
    description: 'Curated luxury goods, electronics, and fashion at LuxeStorePay. Fast delivery. Secure payment.',
    images: [`${siteUrl}/og-image.png`],
  },
  verification: {
    google: 'google682a9bc17e9037a4',
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'url': siteUrl,
      'name': 'LuxeStorePay',
      'alternateName': ['LuxeStore', 'Luxe Store Pay', 'LuxeStore Pay', 'Luxe'],
      'description': 'Premium online store for luxury goods, electronics, and fashion.',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      'name': 'LuxeStorePay',
      'alternateName': ['LuxeStore', 'LuxeStore Pay'],
      'url': siteUrl,
      'logo': `${siteUrl}/favicon.ico`,
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body>
        <AuthProvider>
          <div className="global-bg-overlay" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

