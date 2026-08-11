"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/lib/firebaseDb';

/* ─── styles ─── */
const css = `
  .sr-section {
    margin-bottom: 2rem;
  }

  .sr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .sr-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
  }

  .sr-title::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    border-radius: 4px;
    background: linear-gradient(180deg, var(--primary, #6366f1), var(--secondary, #ec4899));
  }

  .sr-see-all {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--primary, #6366f1);
    white-space: nowrap;
    text-decoration: none;
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(99,102,241,0.3);
    transition: background 0.2s, color 0.2s;
    flex-shrink: 0;
  }
  .sr-see-all:hover {
    background: var(--primary, #6366f1);
    color: #fff;
  }

  /* ── arrow buttons ── */
  .sr-arrows {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .sr-arrow {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    background: var(--surface, rgba(255,255,255,0.06));
    color: var(--text-main);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .sr-arrow:hover {
    background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #ec4899));
    color: white;
    border-color: transparent;
    transform: scale(1.1);
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .sr-arrow:active {
    transform: scale(0.95);
  }

  /* ── scroll track ── */
  .sr-wrapper {
    position: relative;
  }

  .sr-track {
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    padding: 6px 4px 12px 4px;
    cursor: grab;
  }
  .sr-track:active {
    cursor: grabbing;
  }
  .sr-track::-webkit-scrollbar { display: none; }

  /* ── product card ── */
  .sr-card {
    flex: 0 0 240px;
    min-width: 240px;
    max-width: 240px;
    scroll-snap-align: start;
    border-radius: 16px;
    background: var(--surface, rgba(255,255,255,0.04));
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    overflow: hidden;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    box-shadow: 0 4px 18px rgba(0,0,0,0.14);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .sr-card:hover {
    transform: translateY(-6px) scale(1.015);
    box-shadow: 0 12px 32px rgba(0,0,0,0.22);
  }

  .sr-card-img-wrap {
    position: relative;
    width: 100%;
    height: 190px;
    overflow: hidden;
  }

  .sr-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 16px 16px 0 0;
    transition: transform 0.4s ease;
  }
  .sr-card:hover .sr-card-img { transform: scale(1.05); }

  .sr-card-img-placeholder {
    width: 100%;
    height: 100%;
    background: var(--surface-hover, rgba(255,255,255,0.06));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }

  .sr-quickview-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    z-index: 3;
    transition: background 0.2s, transform 0.2s;
  }
  .sr-quickview-btn:hover {
    background: var(--primary, #6366f1);
    transform: scale(1.05);
  }

  .sr-card-body {
    padding: 0.9rem 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sr-card-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .sr-card-price {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--secondary, #ec4899);
  }

  .sr-card-footer {
    padding: 0 1rem 1rem;
  }

  /* ── gradient fade on edges ── */
  .sr-fade-right {
    pointer-events: none;
    position: absolute;
    right: 0; top: 0; bottom: 12px;
    width: 60px;
    background: linear-gradient(to right, transparent, var(--background, #0f172a));
    border-radius: 0 16px 16px 0;
  }
`;

interface Props {
  title: string;
  slug?: string;
  products: Product[];
  formatPrice: (p: number) => string;
  onQuickView?: (product: Product) => void;
}

const SCROLL_STEP = 500;

export default function SwipeRow({ title, slug, products, formatPrice, onQuickView }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === 'right' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' });
  };

  // Mouse Drag Scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <>
      <style>{css}</style>
      <div className="sr-section">
        {/* header row */}
        <div className="sr-header">
          <span className="sr-title">{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {slug && slug !== '__uncategorised' && (
              <Link href={`/shop/category/${slug}`} className="sr-see-all">
                See all →
              </Link>
            )}
            <div className="sr-arrows">
              <button
                className="sr-arrow"
                onClick={() => scroll('left')}
                aria-label={`Scroll ${title} left`}
                title="Swipe Left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button
                className="sr-arrow"
                onClick={() => scroll('right')}
                aria-label={`Scroll ${title} right`}
                title="Swipe Right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* scroll track */}
        <div className="sr-wrapper">
          <div
            className="sr-track"
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
          >
            {products.map(p => (
              <div key={p.id} className="sr-card">
                <div className="sr-card-img-wrap">
                  <Link href={`/shop/product/${p.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="sr-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="sr-card-img-placeholder">🛍️</div>
                    )}
                  </Link>
                  {onQuickView && (
                    <button
                      className="sr-quickview-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onQuickView(p);
                      }}
                      title="Quick View preview"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Quick View
                    </button>
                  )}
                </div>

                <Link href={`/shop/product/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="sr-card-body">
                    <div className="sr-card-name" title={p.name}>{p.name}</div>
                    <div className="sr-card-price">{formatPrice(p.price)}</div>
                  </div>
                </Link>
                <div className="sr-card-footer">
                  <AddToCartButton product={p} />
                </div>
              </div>
            ))}
          </div>
          {/* right fade hint */}
          {products.length > 3 && <div className="sr-fade-right" />}
        </div>
      </div>
    </>
  );
}
