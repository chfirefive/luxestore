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

  // Inject Google Rich Results structured data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl || `${siteUrl}/og-image.png`,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/product/${product.id}`,
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
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
