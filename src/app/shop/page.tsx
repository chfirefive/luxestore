"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SkeletonCard from '@/components/SkeletonCard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import AddToCartButton from '@/components/AddToCartButton';
import CategoryRow from '@/components/CategoryRow';
import SwipeRow from '@/components/SwipeRow';
import QuickViewModal from '@/components/QuickViewModal';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { listenToProductsLimited, Product, listenToSettings, StoreSettings, listenToCategories, Category, listenToTrustBadges, subscribeToNewsletter, TrustBadge } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './page.module.css';
import { useCurrency } from '@/hooks/useCurrency';
import { ALL_CURRENCIES } from '@/lib/currency';
import { expandQuery, getRelatedTerms } from '@/lib/searchRelations';

function ShopContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [badges, setBadges] = useState<TrustBadge[]>([]);

  // Quick View Modal State & Recently Viewed Hook
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { recentlyViewedIds, addRecentlyViewed } = useRecentlyViewed();

  const searchParams = useSearchParams();

  // Search & Filter State — pre-fill from ?q= param (Google Sitelinks Searchbox)
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('default');
  const [onlyHot, setOnlyHot] = useState(false);

  // Flash Sale Timer — persisted across page refreshes
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 12 });
  const [timerInit, setTimerInit] = useState(false);

  // Newsletter Email State
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency, formatPrice } = useCurrency();

  useEffect(() => {
    // Set up real-time subscriptions for up to 100 products
    const unsubProducts = listenToProductsLimited(100, (prods) => setAllProducts(prods));
    const unsubCategories = listenToCategories((cats) => setCategories(cats));
    const unsubSettings = listenToSettings((sets) => setSettings(sets));
    const unsubBadges = listenToTrustBadges((bdgs) => setBadges(bdgs));

    setLoading(false);

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubBadges();
    };
  }, []);

  // Timer: persist end time in localStorage
  useEffect(() => {
    const TIMER_KEY = 'luxe_flash_end';
    let endTime = parseInt(localStorage.getItem(TIMER_KEY) || '0', 10);
    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + 4 * 60 * 60 * 1000; // 4 hours from now
      localStorage.setItem(TIMER_KEY, String(endTime));
    }
    setTimerInit(true);

    const timer = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        const newEnd = Date.now() + 4 * 60 * 60 * 1000;
        localStorage.setItem(TIMER_KEY, String(newEnd));
        setTimeLeft({ hours: 4, minutes: 0, seconds: 0 });
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ hours: h, minutes: m, seconds: s });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Smart Semantic Search ──────────────────────────────────────────────
  const expandedTerms = search.trim() ? expandQuery(search.trim()) : [];
  const relatedTerms  = search.trim() ? getRelatedTerms(search.trim()) : [];
  const hasRelated    = relatedTerms.length > 0;

  // Filtering & Sorting Logic
  const filteredProducts = allProducts.filter(p => {
    if (p.archived) return false;

    // Filter by Hot Item toggle
    if (onlyHot && !p.isHot) return false;

    // Smart search: match original query OR any expanded related term
    if (search.trim()) {
      const nameL = p.name.toLowerCase();
      const descL = p.description.toLowerCase();
      const catL  = (p.categorySlug || '').toLowerCase();
      const combined = `${nameL} ${descL} ${catL}`;

      const exactMatch = combined.includes(search.toLowerCase());
      const relatedMatch = expandedTerms.some(term => combined.includes(term));

      if (!exactMatch && !relatedMatch) return false;
    }

    if (category !== 'all' && p.categorySlug !== category) return false;
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  // ── Group products by category for horizontal swipeable rows ──────────
  const isFiltered = !!(search.trim() || category !== 'all' || minPrice || maxPrice || sort !== 'default' || onlyHot);
  const categoryRows: { slug: string; name: string; products: typeof sortedProducts }[] = [];
  if (!isFiltered) {
    const seen = new Map<string, typeof sortedProducts>();
    for (const p of allProducts.filter(p => !p.archived)) {
      const slug = p.categorySlug || '__uncategorised';
      if (!seen.has(slug)) seen.set(slug, []);
      seen.get(slug)!.push(p);
    }
    for (const cat of categories) {
      if (seen.has(cat.slug) && seen.get(cat.slug)!.length > 0) {
        categoryRows.push({ slug: cat.slug, name: cat.name, products: seen.get(cat.slug)! });
      }
    }
    if (seen.has('__uncategorised') && seen.get('__uncategorised')!.length > 0) {
      categoryRows.push({ slug: '__uncategorised', name: 'Other Products', products: seen.get('__uncategorised')! });
    }
  }

  // Flash Sale Items
  const flashSaleItems = allProducts.filter(p => !p.archived).slice(0, 6).map((p, idx) => ({
    ...p,
    discountPrice: p.price * 0.8,
    progress: idx === 0 ? 82 : idx === 1 ? 45 : 12,
    discountPercent: 20
  }));

  // Hot Items
  const hotItems = allProducts.filter(p => !p.archived && p.isHot);

  // Recently Viewed Products
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => allProducts.find(p => String(p.id) === String(id)))
    .filter((p): p is Product => Boolean(p && !p.archived));

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('default');
    setOnlyHot(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const section = document.getElementById('shop-now');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenQuickView = (product: Product) => {
    addRecentlyViewed(product.id);
    setQuickViewProduct(product);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      await subscribeToNewsletter(email);
      setNewsletterSubscribed(true);
      setEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <>
      <Navbar />

      <main className={`${styles.main} animate-fade-in`}>
        {/* Banner / Hero Slider */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className="title" style={{ fontSize: '3.4rem', lineHeight: '1.2' }}>
                {settings?.heroTitle || 'Elevate Your Lifestyle.'}
              </h1>
              <p className={styles.heroSubtitle}>
                {settings?.heroSubtitle || 'Discover curated luxury goods, high-end electronics, and premium fashion designed for the modern connoisseur.'}
              </p>
              <div className={styles.heroActions}>
                <a href="#shop-now" className="btn-primary shine-effect" style={{ padding: '15px 32px', fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Shop Now
                </a>
                <a href="#flash-deals" className={`${styles.secondaryBtn} shine-effect`} style={{ textDecoration: 'none' }}>
                  Explore Flash Deals
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Currency Selector Banner */}
        <section style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0.85rem 0'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              💱 Viewing prices in:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontWeight: 800, fontSize: '1.05rem'
              }}>
                {currency.symbol} {currency.name} ({currency.code})
              </span>
              <select
                id="home-currency-select"
                value={currency.code}
                onChange={e => {
                  const c = ALL_CURRENCIES.find(c => c.code === e.target.value);
                  if (c) setCurrency(c);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text-main)',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Select display currency"
              >
                {ALL_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — All prices update across every page automatically
            </span>
          </div>
        </section>

        {/* Dynamic Horizontal Categories Ribbon */}
        <section className={styles.categorySection}>
          <div className="container">
            <CategoryRow onSearch={q => {
              setSearch(q);
              const sec = document.getElementById('shop-now');
              if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
        </section>

        {/* Hot Items Section - Swipeable Left & Right Row */}
        {hotItems.length > 0 && (
          <section id="hot-items" style={{ padding: '3rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
              <SwipeRow
                title="🔥 Hot Items (Trending)"
                products={hotItems}
                formatPrice={formatPrice}
                onQuickView={handleOpenQuickView}
              />
            </div>
          </section>
        )}

        {/* Dynamic Flash Sale Section - Swipeable Left & Right Row */}
        <section id="flash-deals" className={styles.flashSale}>
          <div className="container">
            <div className={styles.flashHeader}>
              <div className={styles.flashTitleBox}>
                <span className={styles.flashIcon}>⚡</span>
                <h2 className="title" style={{ fontSize: '2rem', margin: 0 }}>Flash Deals</h2>
              </div>
              <div className={styles.flashTimer}>
                <span>Ending In:</span>
                <span className={styles.timerUnit}>{String(timeLeft.hours).padStart(2, '0')}</span> :
                <span className={styles.timerUnit}>{String(timeLeft.minutes).padStart(2, '0')}</span> :
                <span className={styles.timerUnit}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <SwipeRow
              title="Limited Time Offers"
              products={flashSaleItems}
              formatPrice={formatPrice}
              onQuickView={handleOpenQuickView}
            />
          </div>
        </section>

        {/* Dynamic E-Commerce Catalog Grid & Filters */}
        <section id="shop-now" className={styles.productShowcase}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Just For You</h2>
              <p className={styles.sectionSubtitle}>Browse, filter, and order premium items catalogued directly in our menus.</p>
            </div>

            {/* Filter Bar with Form on Enter Submit */}
            <div className={styles.filterBar}>
              <form onSubmit={handleSearchSubmit} className={styles.filterRowMain}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    id="shop-search"
                    name="shop-search"
                    type="text"
                    aria-label="Search items"
                    placeholder="Search items & press Enter (e.g. phone, shoes, watch...)"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`${styles.filterInput} neumorphic-inner`}
                    style={{ paddingLeft: '40px', border: 'none', width: '100%' }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="Submit search"
                  >
                    <Icons.Search />
                  </button>
                </div>

                <div>
                  <select
                    id="shop-category"
                    name="shop-category"
                    aria-label="Filter by category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className={`${styles.filterSelect} neumorphic-inner`}
                    style={{ border: 'none' }}
                  >
                    <option value="all">All Category Menus</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    id="shop-sort"
                    name="shop-sort"
                    aria-label="Sort products"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className={`${styles.filterSelect} neumorphic-inner`}
                    style={{ border: 'none' }}
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetical: A-Z</option>
                  </select>
                </div>
              </form>

              {/* Quick Filter Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Filters:</span>
                <button
                  onClick={() => setOnlyHot(h => !h)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: onlyHot ? '1px solid var(--secondary)' : '1px solid var(--border)',
                    background: onlyHot ? 'var(--secondary)' : 'var(--surface)',
                    color: onlyHot ? 'white' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🔥 Hot Items Only
                </button>

                <button
                  onClick={() => { setMaxPrice('5000'); setMinPrice(''); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: maxPrice === '5000' ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: maxPrice === '5000' ? 'var(--primary)' : 'var(--surface)',
                    color: maxPrice === '5000' ? 'white' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🏷️ Under 5k
                </button>

                <button
                  onClick={() => { setMaxPrice('15000'); setMinPrice(''); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: maxPrice === '15000' ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: maxPrice === '15000' ? 'var(--primary)' : 'var(--surface)',
                    color: maxPrice === '15000' ? 'white' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🏷️ Under 15k
                </button>

                {(search || category !== 'all' || minPrice || maxPrice || sort !== 'default' || onlyHot) && (
                  <button onClick={handleClearFilters} className={styles.clearFiltersBtn}>
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className={styles.filterRowSecond} style={{ marginTop: '12px' }}>
                <div className={styles.priceRangeInputs}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Price Limit:</span>
                  <input
                    id="shop-min-price"
                    name="shop-min-price"
                    type="number"
                    aria-label="Minimum price"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className={`${styles.priceInput} neumorphic-inner`}
                    style={{ border: 'none' }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <input
                    id="shop-max-price"
                    name="shop-max-price"
                    type="number"
                    aria-label="Maximum price"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className={`${styles.priceInput} neumorphic-inner`}
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Related-terms badge — shows when semantic expansion is active */}
            {search.trim() && hasRelated && filteredProducts.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
                marginBottom: '1.25rem', padding: '10px 16px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '10px', fontSize: '0.83rem',
              }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>🔍 Also showing related items for:</span>
                {relatedTerms.slice(0, 8).map(t => (
                  <span
                    key={t}
                    onClick={() => setSearch(t)}
                    style={{
                      cursor: 'pointer', padding: '3px 10px',
                      background: 'var(--glass-bg)', border: '1px solid var(--border)',
                      borderRadius: '20px', color: 'var(--text-muted)',
                      transition: 'all 0.2s', fontWeight: 500,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--primary)';
                      (e.currentTarget as HTMLElement).style.color = 'white';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* ── Products: swipeable rows by category (browse) or flat grid (filtered) ── */}
            {loading ? (
              <div className="grid-3">
                {[...Array(displayedCount)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isFiltered ? (
              /* ── Filtered flat grid ─────────────────────────────── */
              sortedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>No products match your active search filter settings.</p>
                  <button onClick={handleClearFilters} className="btn-primary" style={{ padding: '10px 20px' }}>Show All Products</button>
                </div>
              ) : (
                <>
                  <div className="grid-3">
                    {sortedProducts.slice(0, displayedCount).map(item => (
                      <ProductCard
                        key={`catalog-${item.id}`}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        image={item.imageUrl}
                        description={item.description}
                        comments={Math.floor(Math.random() * 40)}
                        product={item}
                        onQuickView={handleOpenQuickView}
                      />
                    ))}
                    <div ref={sentinelRef} />
                  </div>
                  {sortedProducts.length > displayedCount && (
                    <button
                      className={`${styles.loadMoreBtn} neumorphic-btn`}
                      style={{ border: 'none' }}
                      onClick={() => setDisplayedCount(c => c + 12)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      Load More Products
                    </button>
                  )}
                </>
              )
            ) : (
              /* ── Browse mode: horizontal swipeable rows per category ── */
              categoryRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No products yet. Check back soon!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  {categoryRows.map(row => (
                    <SwipeRow
                      key={row.slug}
                      title={row.name}
                      slug={row.slug}
                      products={row.products}
                      formatPrice={formatPrice}
                      onQuickView={handleOpenQuickView}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        {/* Recently Viewed Products Section */}
        {recentlyViewedProducts.length > 0 && (
          <section style={{ padding: '3rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <SwipeRow
                title="👁️ Recently Viewed Products"
                products={recentlyViewedProducts}
                formatPrice={formatPrice}
                onQuickView={handleOpenQuickView}
              />
            </div>
          </section>
        )}

        {/* Guarantees Trust Banner */}
        {badges.filter(b => b.active).length > 0 && (
          <section className={styles.guarantees}>
            <div className="container">
              <div className={styles.guaranteesGrid}>
                {badges.filter(b => b.active).map((g) => {
                  let badgeIcon = <Icons.Store style={{ width: '24px', height: '24px' }} />;
                  if (g.id === 'returns') badgeIcon = <Icons.Check style={{ width: '24px', height: '24px' }} />;
                  if (g.id === 'secure') badgeIcon = <Icons.Shield style={{ width: '24px', height: '24px' }} />;
                  if (g.id === 'helpline') badgeIcon = <Icons.Phone style={{ width: '24px', height: '24px' }} />;

                  return (
                    <div key={g.id} className={styles.guaranteeCard}>
                      <div className={styles.guaranteeIcon}>{badgeIcon}</div>
                      <h3 className={styles.guaranteeTitle}>{g.title}</h3>
                      <p className={styles.guaranteeDesc}>{g.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <section className={styles.newsletter}>
          <div className="container">
            <div className={styles.newsletterContent}>
              <h2 className={styles.newsletterTitle}>Subscribe to Our Newsletter</h2>
              <p className={styles.newsletterDesc}>Get early alerts for flash sales, upcoming product collections, and weekly discounts directly in your inbox.</p>

              <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                <label htmlFor="newsletterEmail" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Email address</label>
                <input
                  id="newsletterEmail"
                  name="newsletterEmail"
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.filterInput}
                  style={{ background: 'var(--surface)' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '14px 28px', flexShrink: 0 }}>
                  Subscribe
                </button>
              </form>

              {newsletterSubscribed && (
                <p style={{ color: '#10b981', fontWeight: 600, marginTop: '1rem' }}>
                  🎉 Thank you for subscribing! Check your inbox soon.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Multi-column E-commerce Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <a href="#" className={styles.footerLogo}>
                <Icons.Store /> LuxeStore
              </a>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.7', marginTop: '0.5rem' }}>
                Curating luxury, high-end electronics, and premium fashion collections designed for the modern connoisseur worldwide.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <a href={settings?.socialFacebook || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Icons.Facebook width="20" height="20" /></a>
                <a href={settings?.socialInstagram || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Icons.Instagram width="20" height="20" /></a>
                <a href={settings?.socialTwitter || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Icons.Twitter width="20" height="20" /></a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <h3>Customer Care</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">How to Buy</a></li>
                <li><a href="#">Returns & Refunds</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Purchase Policy</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h3>LuxeStore</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Latest News</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h3>Get in Touch</h3>
              <ul className={styles.footerLinks}>
                <li style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Mail width="16" height="16" /> {settings?.contactEmail || 'support@luxestore.com'}</li>
                <li style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Phone width="16" height="16" /> {settings?.contactPhone || '+1 (555) 123-4567'}</li>
                <li style={{ fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '8px' }}><Icons.MapPin width="16" height="16" style={{ marginTop: '3px' }} /> <span>{settings?.contactAddress || '123 Luxury Avenue, Beverly Hills, CA 90210'}</span></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} LuxeStore. All Rights Reserved.</p>
            <div className={styles.paymentPartners}>
              <span className={styles.paymentBadge}>VISA</span>
              <span className={styles.paymentBadge}>Mastercard</span>
              <span className={styles.paymentBadge}>PayPal</span>
              <span className={styles.paymentBadge}>Apple Pay</span>
              <span className={styles.paymentBadge}>COD</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}
