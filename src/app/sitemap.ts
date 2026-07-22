import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/firebaseDb';
import { getCategories } from '@/lib/firebaseDb';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestorepay.vercel.app';


  const [products, categories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/shop/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/shop/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(c => c.active)
    .map(c => ({
      url: `${base}/shop/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  const productRoutes: MetadataRoute.Sitemap = products
    .filter(p => !p.archived)
    .map(p => ({
      url: `${base}/shop/product/${p.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
