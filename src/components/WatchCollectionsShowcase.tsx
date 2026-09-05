"use client";

import React, { useRef } from 'react';
import { Category, Product } from '@/lib/firebaseDb';

interface Props {
  categories: Category[];
  products: Product[];
  onSelectCategory?: (slug: string) => void;
}

// Watch curated image library matching the reference store categories
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  men: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  women: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80',
  couple: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
  'mens-chain-watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'mens-formal-watches': 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80',
  'mens-casual-watches': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
  'all-timepieces': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
};

export default function WatchCollectionsShowcase({ categories, products, onSelectCategory }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeCategories = categories.filter(c => c.active);

  if (activeCategories.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const distance = 280;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  return (
    <section id="collections-showcase" className="watch-collections-section">
      <style>{`
        .watch-collections-section {
          padding: 3.5rem 0 2rem;
          background: transparent;
        }

        .watch-collections-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .watch-collections-title-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-grow: 1;
        }

        .watch-collections-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-main);
          white-space: nowrap;
          margin: 0;
        }

        .watch-collections-line {
          height: 1px;
          background: linear-gradient(to right, rgba(214, 178, 105, 0.4), rgba(214, 178, 105, 0.05));
          flex-grow: 1;
        }

        .watch-collections-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .watch-nav-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(214, 178, 105, 0.3);
          background: var(--surface);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .watch-nav-btn:hover {
          background: #D6B269;
          color: #0b0f17;
          border-color: #D6B269;
        }

        .watch-collections-track {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 8px 4px 16px;
        }

        .watch-collections-track::-webkit-scrollbar {
          display: none;
        }

        .watch-collection-card {
          flex: 0 0 calc(16.666% - 1.05rem);
          min-width: 170px;
          max-width: 210px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .watch-collection-card:hover {
          transform: translateY(-5px);
        }

        .watch-collection-media-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(214, 178, 105, 0.2);
          margin-bottom: 0.85rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .watch-collection-card:hover .watch-collection-media-box {
          border-color: #D6B269;
          box-shadow: 0 10px 24px rgba(214, 178, 105, 0.25);
        }

        .watch-collection-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .watch-collection-card:hover .watch-collection-img {
          transform: scale(1.08);
        }

        .watch-collection-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          text-align: center;
          margin-top: 2px;
          transition: color 0.2s;
        }

        .watch-collection-card:hover .watch-collection-name {
          color: #D6B269;
        }

        .watch-collection-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 1100px) {
          .watch-collection-card {
            flex: 0 0 calc(25% - 1rem);
          }
        }

        @media (max-width: 768px) {
          .watch-collection-card {
            flex: 0 0 145px;
            min-width: 145px;
          }
          .watch-collections-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="watch-collections-header">
          <div className="watch-collections-title-box">
            <h2 className="watch-collections-title">Curated Collections</h2>
            <hr className="watch-collections-line" />
          </div>

          <div className="watch-collections-nav">
            <button
              onClick={() => scroll('left')}
              className="watch-nav-btn"
              aria-label="Scroll collections left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="watch-nav-btn"
              aria-label="Scroll collections right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="watch-collections-track" ref={sliderRef}>
          {activeCategories.map(cat => {
            // Find products count for category
            const count = products.filter(p => !p.archived && p.categorySlug === cat.slug).length;
            // Find a product image in this category or use curated watch fallback
            const productWithImg = products.find(p => !p.archived && p.categorySlug === cat.slug && p.imageUrl);
            const imgSrc = productWithImg?.imageUrl || DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES['men'];

            return (
              <div
                key={cat.id}
                className="watch-collection-card"
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(cat.slug);
                  }
                }}
              >
                <div className="watch-collection-media-box">
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    className="watch-collection-img"
                    loading="lazy"
                    style={{
                      objectPosition: productWithImg?.imagePosition || 'center',
                      objectFit: productWithImg?.imageFit || 'cover'
                    }}
                  />
                </div>
                <span className="watch-collection-name">{cat.name}</span>
                <span className="watch-collection-count">
                  {count} {count === 1 ? 'Timepiece' : 'Pieces'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
