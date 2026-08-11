"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Product, addToCart } from '@/lib/firebaseDb';
import { useCurrency } from '@/hooks/useCurrency';
import { Icons } from '@/components/Icons';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const { formatPrice } = useCurrency();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const activeImage = images[activeImgIndex] || product.imageUrl;

  const handleAddToCart = () => {
    addToCart(product, undefined, undefined, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '28px',
          color: 'var(--text-main)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface-hover)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.2s, background 0.2s'
          }}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left: Product Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '3rem', opacity: 0.5 }}>🛍️</span>
            )}
            {product.isHot && (
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                🔥 Hot Item
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '10px',
                    border: idx === activeImgIndex ? '2px solid var(--primary)' : '1px solid var(--border)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'none',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {product.categorySlug || 'General'}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>
                ★ 4.9 (High Rated)
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '10px' }}>
              {product.name}
            </h2>

            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '14px' }}>
              {formatPrice(product.price)}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              {product.description || 'No detailed description available for this luxury product.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity:</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--surface-hover)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '2px 6px'
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-main)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontWeight: 700, fontSize: '0.95rem' }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-main)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                ✓ In Stock (Fast Shipping)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleAddToCart}
              className="btn-primary shine-effect"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Icons.Cart /> {added ? '✓ Added to Cart!' : `Add ${qty} to Cart`}
            </button>

            <Link
              href={`/shop/product/${product.id}`}
              onClick={onClose}
              style={{
                textAlign: 'center',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                padding: '6px'
              }}
            >
              View Full Product Details Page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
