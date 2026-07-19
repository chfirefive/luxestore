"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AddToCartButton from './AddToCartButton';
import { Product } from '@/lib/firebaseDb';
import React from 'react';
import styles from './ProductCard.module.css';

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
  const [wishlisted, setWishlisted] = useState(false);
  const stock = product?.stock ?? 99;
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  return (
    <div className={`card ${styles.productCard}`}>
      <Link href={`/shop/product/${id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className={styles.imageWrapper}>
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
            <p className={styles.price}>${price.toFixed(2)}</p>
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
        <AddToCartButton product={product ?? { id: String(id), name, price, categorySlug: '', description: description || '', imageUrl: image, stock: 1 }} />
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
