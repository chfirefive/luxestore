"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AddToCartButton from './AddToCartButton';
import { Product } from '@/lib/firebaseDb';
import React from 'react';
import styles from './ProductCard.module.css';
import { useCurrency } from '@/hooks/useCurrency';

type ProductCardProps = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  comments?: number;
  product?: Product;
  onQuickView?: (product: Product) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, description, comments = 0, product, onQuickView }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const { formatPrice } = useCurrency();
  const stock = product?.stock ?? 99;
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  const currentProduct: Product = product ?? {
    id: String(id),
    name,
    price,
    categorySlug: '',
    description: description || '',
    imageUrl: image,
    stock: 1
  };

  return (
    <div className={`neumorphic-outer ${styles.productCard}`}>
      <Link href={`/shop/product/${id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className={styles.imageWrapper} style={{ position: 'relative' }}>
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className={styles.productImage}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <p>{description || 'No description available.'}</p>
            </div>
          )}

          {/* Rating badge */}
          <div className={styles.ratingBadge}>★ 4.9</div>

          {/* Quick View overlay button */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(currentProduct);
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                zIndex: 4,
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, background 0.2s'
              }}
              title="Quick View preview"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Quick View
            </button>
          )}

          {/* HOT ITEM badge - ONLY shown if owner enabled isHot */}
          {product?.isHot && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '54px',
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              letterSpacing: '0.5px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔥 HOT ITEM
            </div>
          )}

          {/* Stock badge */}
          {isOutOfStock && (
            <div className={styles.stockBadgeOut}>Sold Out</div>
          )}
          {isLowStock && (
            <div className={styles.stockBadgeLow}>Only {stock} left!</div>
          )}
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.productName}>{name}</h3>
          <div className={styles.priceRow}>
            <p className={styles.price}>{formatPrice(price)}</p>
            <span className={styles.comments}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {comments}
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist heart button */}
      <button
        className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setWishlisted(w => !w); }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <AddToCartButton product={currentProduct} />
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
