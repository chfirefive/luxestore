"use client";

import React from 'react';
import { TickerItem } from '@/lib/firebaseDb';

interface Props {
  items?: TickerItem[];
  show?: boolean;
}

const renderIcon = (type: TickerItem['icon']) => {
  switch (type) {
    case 'truck':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      );
    case 'shield':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case 'clock':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'star':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'gift':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
  }
};

export default function LuxuryTicker({ items = [], show = true }: Props) {
  const activeItems = items.filter(i => i.active);

  if (!show || activeItems.length === 0) return null;

  // Duplicate list to achieve seamless infinite scroll
  const displayItems = [...activeItems, ...activeItems, ...activeItems, ...activeItems];

  return (
    <div className="luxury-ticker-wrapper" aria-label="Store Guarantees and Highlights">
      <style>{`
        .luxury-ticker-wrapper {
          background: #121212;
          border-bottom: 1px solid rgba(214, 178, 105, 0.25);
          color: #f5f5f5;
          overflow: hidden;
          position: relative;
          white-space: nowrap;
          user-select: none;
          padding: 8px 0;
          font-size: 0.85rem;
          letter-spacing: 0.03em;
        }

        .luxury-ticker-track {
          display: inline-flex;
          align-items: center;
          gap: 3rem;
          animation: luxuryTickerScroll 35s linear infinite;
        }

        .luxury-ticker-track:hover {
          animation-play-state: paused;
        }

        .luxury-ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #e5e5e5;
          font-weight: 500;
        }

        .luxury-ticker-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #D6B269; /* Timezone Watches signature gold */
          filter: drop-shadow(0 0 4px rgba(214, 178, 105, 0.4));
        }

        .luxury-ticker-dot {
          color: rgba(214, 178, 105, 0.4);
          font-size: 1.2rem;
          line-height: 0;
        }

        @keyframes luxuryTickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .luxury-ticker-wrapper {
            font-size: 0.76rem;
            padding: 7px 0;
          }
          .luxury-ticker-track {
            gap: 2rem;
            animation-duration: 25s;
          }
        }
      `}</style>

      <div className="luxury-ticker-track">
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.id}-${index}`}>
            <div className="luxury-ticker-item">
              <span className="luxury-ticker-icon">{renderIcon(item.icon)}</span>
              <span>{item.text}</span>
            </div>
            <span className="luxury-ticker-dot">•</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
