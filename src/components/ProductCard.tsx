import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';
import { Product } from '@/lib/firebaseDb';
import React from 'react';

type ProductCardProps = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  comments?: number;
  product?: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, description, comments = 0, product }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link href={`/shop/product/${id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
        {image ? (
          <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
            <Image
              src={image}
              alt={name}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
            />
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              ★ 4.9
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '220px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center' }}>
              {description || 'No description available.'}
            </p>
          </div>
        )}
        <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', fontWeight: 600 }}>{name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--primary)', fontSize: '1.35rem', fontWeight: 700 }}>${price.toFixed(2)}</p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {comments}
            </span>
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <AddToCartButton product={product ?? { id: String(id), name, price, categorySlug: '', description: description || '', imageUrl: image, stock: 1 }} />
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
