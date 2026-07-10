import { getProducts, getCategories } from '@/lib/firebaseDb';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find(c => c.slug === slug);
  const title = cat ? cat.name : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestore.vercel.app';

  return {
    title: `${title} Collection`,
    description: `Browse our exclusive collection of ${title.toLowerCase()} at LuxeStore. Top quality products with free delivery options.`,
    openGraph: {
      title: `${title} Collection | LuxeStore`,
      description: `Browse our exclusive collection of ${title.toLowerCase()} at LuxeStore.`,
      url: `${siteUrl}/shop/category/${slug}`,
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find(c => c.slug === slug);
  const title = cat ? cat.name : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const allProducts = await getProducts();
  const products = allProducts.filter(p => p.categorySlug === slug && !p.archived);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
        
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '3rem' }}>{title} Collection</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Discover our curated selection of premium {title.toLowerCase()}. Expertly crafted and sourced for the modern connoisseur.
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No products have been added to this category yet.</p>
          </div>
        ) : (
          <div className="grid-3">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.imageUrl}
                description={item.description}
                comments={Math.floor(Math.random() * 50)} // Mock comments count
                product={item}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
