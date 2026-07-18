"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart, Product } from '@/lib/firebaseDb';
import { Icons } from './Icons';

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = useCallback(() => {
    if (isOutOfStock || debounceRef.current) return;

    addToCart(product);
    setAdded(true);

    // Navigate to cart page after a brief visual confirmation
    setTimeout(() => {
      setAdded(false);
      router.push('/cart');
    }, 800);

    // Debounce: block rapid duplicate clicks for 1s
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
    }, 1000);
  }, [isOutOfStock, product, router]);

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          fontSize: '0.95rem',
          cursor: 'not-allowed',
          opacity: 0.6,
        }}
      >
        <Icons.Shield /> Sold Out
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="btn-primary shine-effect"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        fontSize: '0.95rem',
        background: added ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
        transition: 'background 0.3s ease',
      }}
    >
      {added ? <><Icons.Check /> Added!</> : <><Icons.Cart /> Add to Cart</>}
    </button>
  );
}
