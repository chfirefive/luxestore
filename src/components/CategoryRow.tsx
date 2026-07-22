"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Icons } from './Icons';
import { listenToCategories, Category } from '@/lib/firebaseDb';

export default function CategoryRow() {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const unsub = listenToCategories(cats => {
      const activeCats = cats.filter(c => c.active);
      setCategories(activeCats);
    });
    return () => unsub();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (categories.length === 0) return null;

  return (
    <div style={{ position: 'relative', maxWidth: '100%', margin: '2rem 0' }}>
      {showLeft && (
        <button 
          onClick={() => scroll('left')}
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Icons.ArrowRight style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          padding: '0.5rem 40px',
          justifyContent: 'center',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map(cat => (
          <Link 
            key={cat.id} 
            href={`/shop/category/${cat.slug}`}
            className="category-pill"
            style={{
              padding: '12px 24px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: '30px',
              color: 'var(--text-main)',
              textDecoration: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <style>{`
        .category-pill:hover {
          background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
          color: white !important;
          border-color: transparent !important;
          transform: translateY(-2px);
        }
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {showRight && (
        <button 
          onClick={() => scroll('right')}
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Icons.ArrowRight />
        </button>
      )}
    </div>
  );
}
