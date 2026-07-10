"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import { getCategories, Category, getProductById, updateProduct } from '@/lib/firebaseDb';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProductById(id)]).then(([cats, prod]) => {
      setCategories(cats);
      if (prod) {
        setName(prod.name);
        setPrice(prod.price.toString());
        setCategory(prod.categorySlug);
        setImageUrl(prod.imageUrl || '');
        setDescription(prod.description);
        setArchived(!!prod.archived);
      } else {
        setError('Product not found in Firestore');
      }
      setLoading(false);
    });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await updateProduct(id, {
        name,
        price: parseFloat(price),
        categorySlug: category,
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || 'No description provided.',
        archived,
      });
      router.push('/owner/products');
    } catch {
      setError('Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading product...</div>;
  }

  if (error && !name) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.2rem' }}>{error}</p>
        <button onClick={() => router.push('/owner/products')} className="btn-primary">Back to Products</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <button onClick={() => router.push('/owner/products')}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="title" style={{ fontSize: '2.2rem', margin: 0 }}>Edit Product</h1>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Product Name</label>
              <input id="product-name" name="product-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Leather Bag"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-price" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Price ($)</label>
              <input id="product-price" name="product-price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g. 199.99"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-category" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Assign to Menu</label>
              <select id="product-category" name="product-category" value={category} onChange={e => setCategory(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem' }}>
                {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-image" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Upload Image (Optional)</label>
              <input id="product-image" name="product-image" type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImageUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  } else setImageUrl('');
                }}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              {imageUrl && (
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setImageUrl('')}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-description" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
              <textarea id="product-description" name="product-description" value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Enter details about this product..."
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical', lineHeight: 1.6 }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-hover)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input id="archived" name="archived" type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
            <label htmlFor="archived" style={{ fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Archive Product (Hidden from buyer store pages)
            </label>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
              <Icons.Check /> {saving ? 'Saving to Firestore...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/owner/products')}
              style={{ padding: '12px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
