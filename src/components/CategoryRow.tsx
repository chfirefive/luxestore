"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenToCategories, Category } from '@/lib/firebaseDb';

/* ─── Inline styles scoped to this component ─── */
const css = `
  .cr-card {
    max-width: 100%;
    border-radius: 15px;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    gap: 0;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow:
      inset 0 0 20px rgba(255,255,255,0.08),
      inset 0 0 5px  rgba(255,255,255,0.12),
      0 5px 5px rgba(0,0,0,0.18);
    transition: background 0.5s;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    background: var(--glass-bg, rgba(255,255,255,0.04));
    border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
    margin: 1.5rem 0;
  }

  .cr-card::-webkit-scrollbar { display: none; }

  .cr-card:hover { background: rgba(173,173,173,0.06); }

  .cr-card ul {
    padding: 0.75rem 1.5rem;
    display: flex;
    list-style: none;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    flex-direction: row;
    margin: 0 auto;
    width: max-content;
    max-width: 100%;
  }

  .cr-card ul li { cursor: pointer; flex-shrink: 0; }

  /* ── svg circle button ── */
  .cr-svg {
    transition: all 0.3s;
    padding: 1rem;
    height: 60px;
    width: 60px;
    border-radius: 100%;
    color: var(--text-main);
    fill: currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 0 20px rgba(255,255,255,0.18),
      inset 0 0 5px  rgba(255,255,255,0.28),
      0 5px 5px rgba(0,0,0,0.18);
    background: var(--surface, rgba(255,255,255,0.06));
    flex-shrink: 0;
  }

  /* ── tooltip label ── */
  .cr-text {
    opacity: 0;
    border-radius: 5px;
    padding: 4px 8px;
    transition: all 0.3s;
    color: var(--text-main);
    background-color: var(--surface, rgba(255,255,255,0.5));
    position: absolute;
    z-index: 9999;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    box-shadow:
      -5px 0 1px rgba(153,153,153,0.18),
      -10px 0 1px rgba(153,153,153,0.12),
      inset 0 0 20px rgba(255,255,255,0.22),
      inset 0 0 5px rgba(255,255,255,0.35),
      0 5px 5px rgba(0,0,0,0.08);
  }

  /* ── isometric wrapper ── */
  .cr-iso {
    transition: 0.5s;
    position: relative;
    display: flex;
    align-items: center;
  }

  .cr-iso:hover .cr-svg {
    transform: translate(5px, -5px);
  }

  .cr-iso:hover .cr-text {
    opacity: 1;
    transform: translate(25px, -2px) skew(-5deg);
  }

  /* ── ring layers ── */
  .cr-iso span {
    opacity: 0;
    position: absolute;
    border-radius: 50%;
    transition: all 0.3s;
    height: 60px;
    width: 60px;
    top: 0;
    left: 0;
    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.08),
      inset 0 0 5px  rgba(0,0,0,0.12),
      0 5px 5px rgba(0,0,0,0.18);
    border: 1px solid var(--border, rgba(255,255,255,0.1));
  }

  .cr-iso:hover span          { opacity: 1; }
  .cr-iso:hover span:nth-child(1) { opacity: 0.1; }
  .cr-iso:hover span:nth-child(2) { opacity: 0.2; transform: translate(5px,  -5px);  }
  .cr-iso:hover span:nth-child(3) { opacity: 0.35; transform: translate(10px, -10px); }

  /* ── active / selected ── */
  .cr-iso.cr-active .cr-svg {
    background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #ec4899));
    color: white;
    box-shadow:
      0 0 20px rgba(99,102,241,0.35),
      0 5px 12px rgba(0,0,0,0.22);
  }

  /* ── "All" emoji icon ── */
  .cr-emoji {
    font-size: 1.4rem;
    line-height: 1;
  }
`;

/* ─── icon SVGs keyed by common category name keywords ─── */
function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();

  if (n.includes('electr') || n.includes('tech') || n.includes('gadget'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
      </svg>
    );

  if (n.includes('fashion') || n.includes('cloth') || n.includes('wear') || n.includes('apparel'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    );

  if (n.includes('home') || n.includes('decor') || n.includes('furniture') || n.includes('interior'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    );

  if (n.includes('beauty') || n.includes('cosmet') || n.includes('skincare') || n.includes('makeup'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.5 22 2 17.5 2 12 2 6.5 6.5 2 12 2c1.5 0 3 .4 4.3 1L13 10h6l1 6-3.3 3.3c-1.4.9-3 1.7-4.7 1.7z"/>
      </svg>
    );

  if (n.includes('sport') || n.includes('fitness') || n.includes('gym') || n.includes('outdoor'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    );

  if (n.includes('book') || n.includes('stationer') || n.includes('office'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    );

  if (n.includes('food') || n.includes('drink') || n.includes('grocery') || n.includes('kitchen'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    );

  if (n.includes('toy') || n.includes('kid') || n.includes('child') || n.includes('baby'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    );

  if (n.includes('jewel') || n.includes('watch') || n.includes('access') || n.includes('luxury'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );

  if (n.includes('pet') || n.includes('animal'))
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/>
      </svg>
    );

  // generic: tag / label fallback
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

export default function CategoryRow() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = listenToCategories(cats => {
      setCategories(cats.filter(c => c.active));
    });
    return () => unsub();
  }, []);

  if (categories.length === 0) return null;

  return (
    <>
      <style>{css}</style>

      <div className="cr-card" role="navigation" aria-label="Browse product categories">
        <ul>
          {/* "All" button */}
          <li>
            <div
              className="cr-iso"
              onClick={() => router.push('/shop')}
              role="button"
              tabIndex={0}
              aria-label="All categories"
              onKeyDown={e => e.key === 'Enter' && router.push('/shop')}
            >
              <span />
              <span />
              <span />
              <div className="cr-svg">
                <span className="cr-emoji">🏪</span>
              </div>
              <div className="cr-text">All</div>
            </div>
          </li>

          {categories.map(cat => (
            <li key={cat.id}>
              <div
                className="cr-iso"
                onClick={() => router.push(`/shop/category/${cat.slug}`)}
                role="button"
                tabIndex={0}
                aria-label={cat.name}
                onKeyDown={e => e.key === 'Enter' && router.push(`/shop/category/${cat.slug}`)}
              >
                <span />
                <span />
                <span />
                <div className="cr-svg">
                  <CategoryIcon name={cat.name} />
                </div>
                <div className="cr-text">{cat.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
