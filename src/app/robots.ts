import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/shop', '/shop/category/', '/shop/product/', '/shop/about', '/shop/contact'],
        disallow: ['/owner', '/owner-login', '/cart', '/login'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestore.vercel.app'}/sitemap.xml`,
  };
}
