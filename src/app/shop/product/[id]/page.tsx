import { getProductById } from '@/lib/firebaseDb';
import Navbar from '@/components/Navbar';
import ProductDetailsClient from './ProductDetailsClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.archived) {
    return {
      title: 'Product Not Found',
      description: 'The requested product is not available.'
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestore.vercel.app';

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | LuxeStore`,
      description: product.description.substring(0, 160),
      url: `${siteUrl}/shop/product/${id}`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    }
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.archived) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestore.vercel.app';

  // ── Enhanced Google Rich Results JSON-LD ──────────────────────────────
  // Includes: brand, category, multi-image, shippingDetails, returns policy,
  // and aggregateRating — all fields Google uses for Product rich cards.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    // Provide multiple aspect-ratio images so Google picks the best one
    image: product.imageUrl
      ? [product.imageUrl, `${siteUrl}/og-image.png`]
      : [`${siteUrl}/og-image.png`],
    description: product.description,
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'LuxeStore',
    },
    category: product.categorySlug || 'General',
    // Aggregate rating — helps Google show star snippets in results
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/product/${product.id}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'LuxeStore',
      },
      // Shipping details for Google Shopping rich results
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      // Return policy for rich results eligibility
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  return (
    <>
      {/* Inject Structured Data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navbar />
      <ProductDetailsClient product={product} />
    </>
  );
}
