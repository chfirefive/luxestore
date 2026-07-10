"use client";

import { useState } from 'react';
import { addToCart, Product } from '@/lib/firebaseDb';
import { Icons } from './Icons';

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    // Use sendBeacon if available for fire-and-forget request
    if (navigator.sendBeacon) {
      const url = '/api/add-to-cart'; // placeholder endpoint
      const payload = JSON.stringify(product);
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Debounce clicks to prevent rapid duplicate adds
  const debouncedHandleAdd = (() => {
    let timeout: NodeJS.Timeout | null = null;
    return () => {
      if (timeout) return;
      handleAdd();
      timeout = setTimeout(() => {
        timeout = null;
      }, 300);
    };
  })();

  return (
    <button
      onClick={debouncedHandleAdd}
      className="btn-primary"
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
