"use client";

import { useEffect, useState, useRef } from 'react';
import SkeletonCard from '@/components/SkeletonCard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import AddToCartButton from '@/components/AddToCartButton';
import CategoryRow from '@/components/CategoryRow';
import { listenToProductsLimited, Product, listenToSettings, StoreSettings, listenToCategories, Category, listenToTrustBadges, subscribeToNewsletter, TrustBadge } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './page.module.css';

export default function Shop() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [badges, setBadges] = useState<TrustBadge[]>([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('default');

  // Flash Sale Timer — persisted across page refreshes
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 12 });
  const [timerInit, setTimerInit] = useState(false);

  // Newsletter Email State
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(12); // batch size
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up real-time subscriptions
    const unsubProducts = listenToProductsLimited(12, (prods) => setAllProducts(prods));
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

  // Filtering & Sorting Logic
  const filteredProducts = allProducts.filter(p => {
    // Hide archived
    if (p.archived) return false;

    // Search query match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Category match
    if (category !== 'all' && p.categorySlug !== category) return false;

    // Min price match
    if (minPrice && p.price < parseFloat(minPrice)) return false;

    // Max price match
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // default
  });

  // Mock Flash Sale Products (pick first 2 products for mockup)
  const flashSaleItems = allProducts.filter(p => !p.archived).slice(0, 3).map((p, idx) => ({
    ...p,
    discountPrice: p.price * 0.8, // 20% off
    progress: idx === 0 ? 82 : idx === 1 ? 45 : 12,
    discountPercent: 20
  }));

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('default');
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

        {/* Dynamic Horizontal Categories */}
        <section className={styles.categorySection}>
          <div className="container">
            <CategoryRow />
          </div>
        </section>

        {/* Dynamic Flash Sale Section */}
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

            <div className={styles.flashGrid}>
              {flashSaleItems.map(item => (
                <div key={`flash-${item.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  
                  {/* Discount Badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                    background: 'var(--secondary)', color: 'white', fontWeight: 700,
                    padding: '4px 10px', borderRadius: '30px', fontSize: '0.8rem'
                  }}>
                    -{item.discountPercent}% OFF
                  </div>

                  <Link href={`/shop/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {item.imageUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                          ★ 4.9
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '220px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>
                          {item.description}
                        </p>
                      </div>
                    )}

                    <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 600 }}>{item.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ color: 'var(--secondary)', fontSize: '1.35rem', fontWeight: 700 }}>
                            ${item.discountPrice.toFixed(2)}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textDecoration: 'line-through' }}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.progressContainer}>
                        <div className={styles.progressText}>
                          <span>Claimed</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <AddToCartButton product={{ ...item, price: item.discountPrice }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Dynamic E-Commerce Catalog Grid & Filters */}
        <section id="shop-now" className={styles.productShowcase}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Just For You</h2>
              <p className={styles.sectionSubtitle}>Browse, filter, and order premium items catalogued directly in our menus.</p>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterRowMain}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="shop-search"
                    name="shop-search"
                    type="text"
                    aria-label="Search items"
                    placeholder="Search items by name or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.filterInput}
                    style={{ paddingLeft: '40px' }}
                  />
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Icons.Search />
                  </div>
                </div>

                <div>
                  <select
                    id="shop-category"
                    name="shop-category"
                    aria-label="Filter by category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className={styles.filterSelect}
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
                    className={styles.filterSelect}
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetical: A-Z</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterRowSecond}>
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
                    className={styles.priceInput}
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
                    className={styles.priceInput}
                  />
                </div>
                {(search || category !== 'all' || minPrice || maxPrice || sort !== 'default') && (
                  <button onClick={handleClearFilters} className={styles.clearFiltersBtn}>Clear Filters</button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid-3">
                {[...Array(displayedCount)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
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
                    />
                  ))}
                  <div ref={sentinelRef} />
                </div>
                {sortedProducts.length > displayedCount && (
                  <button
                    className={styles.loadMoreBtn}
                    onClick={() => setDisplayedCount(c => c + 12)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    Load More Products
                  </button>
                )}
              </>
            )}
          </div>
        </section>

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
                <li style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Mail width="16" height="16" /> support@luxestore.com</li>
                <li style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Phone width="16" height="16" /> +1 (555) 123-4567</li>
                <li style={{ fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '8px' }}><Icons.MapPin width="16" height="16" style={{ marginTop: '3px' }} /> <span>123 Luxury Avenue, Beverly Hills, CA 90210</span></li>
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
