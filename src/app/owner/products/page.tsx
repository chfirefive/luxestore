"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import {
  getCategories, Category,
  getProducts, addProduct, updateProduct, deleteProduct, Product
} from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('10');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      if (cats.length > 0) setCategory(cats[0].slug);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    setSaving(true);

    const newProd = await addProduct({
      name,
      price: parseFloat(price),
      categorySlug: category,
      imageUrl: imageUrl.trim() || "",
      description: description.trim() || 'No description provided.',
      stock: parseInt(stock) || 0,
      archived: false,
    });

    setProducts(prev => [newProd, ...prev]);
    setName(''); setPrice(''); setImageUrl(''); setDescription(''); setStock('10');
    setSuccess(`Successfully added "${name}"!`);
    setTimeout(() => setSuccess(''), 3000);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleArchiveToggle = async (prod: Product) => {
    await updateProduct(prod.id, { archived: !prod.archived });
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, archived: !p.archived } : p));
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products from Firestore...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Store /> Add Goods to Menus
        </h1>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Add New Product</h2>

        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Product Name</label>
              <input id="product-name" name="product-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Leather Bag" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-price" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Price ($)</label>
              <input id="product-price" name="product-price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g. 199.99" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-category" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Assign to Menu</label>
              <select id="product-category" name="product-category" value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-stock" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Stock Qty</label>
              <input id="product-stock" name="product-stock" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required placeholder="e.g. 10" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
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
                style={{ padding: '7px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product-description" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Description Details</label>
              <input id="product-description" name="product-description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter details about this product..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
            <Icons.Plus /> {saving ? 'Saving...' : 'Add Product to Store'}
          </button>
        </form>

        {success && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            <Icons.Check /> {success}
          </div>
        )}
      </div>

      {products.filter(p => p.stock <= 0).length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(239,68,68,0.05)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '1.05rem' }}>Attention: You have {products.filter(p => p.stock <= 0).length} product(s) out of stock!</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(239,68,68,0.85)', fontWeight: 400, marginTop: '2px' }}>
              Buyers will see these products as "Sold Out" and won't be able to purchase them. Edit a product to add stock or delete it.
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1rem' }}>All Products ({products.length})</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Image/Details</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Price</th>
              <th className={styles.th}>Category Menu</th>
              <th className={styles.th}>Stock</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products yet. Add your first product above.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className={styles.row}>
                  <td className={styles.td}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.description.substring(0, 30)}...</span>
                    )}
                  </td>
                  <td className={styles.td}><strong>{p.name}</strong></td>
                  <td className={styles.td}>${p.price.toFixed(2)}</td>
                  <td className={styles.td}><span className={styles.statusReady}>{categories.find(c => c.slug === p.categorySlug)?.name || p.categorySlug}</span></td>
                  <td className={styles.td}>
                    {p.stock <= 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        Out of Stock
                      </span>
                    ) : (
                      <span style={{ color: p.stock < 5 ? '#f59e0b' : 'var(--text-muted)', fontWeight: p.stock < 5 ? 700 : 500 }}>
                        {p.stock} units
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={p.archived ? styles.statusPending : styles.statusReady}>
                      {p.archived ? 'Archived' : 'Live'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <a href={`/owner/products/edit/${p.id}`} className="btn-primary" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', textDecoration: 'none', fontSize: '0.85rem' }}>
                      <Icons.Edit /> Edit
                    </a>
                    <button onClick={() => handleArchiveToggle(p)} className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px', fontSize: '0.85rem' }}>
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
