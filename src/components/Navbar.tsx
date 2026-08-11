"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import { getCart, listenToProductsLimited, Product } from '@/lib/firebaseDb';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';
import { useCurrency } from '@/hooks/useCurrency';
import { ALL_CURRENCIES } from '@/lib/currency';

export default function Navbar() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [buyerAuth, setBuyerAuth] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [shouldWobble, setShouldWobble] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Search State in Navbar
  const [navSearch, setNavSearch] = useState('');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const updateCart = () => {
    const cart = getCart();
    const count = cart.reduce((sum, c) => sum + c.qty, 0);
    setCartCount(count);
    setShouldWobble(true);
    setTimeout(() => setShouldWobble(false), 600);
  };

  useEffect(() => {
    setBuyerAuth(
      user?.email || userProfile?.email ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('buyer_auth') ?? '' : '')
    );
    setMounted(true);
    updateCart();
    const unsub = listenToProductsLimited(50, (prods) => {
      setProductsList(prods.filter(p => !p.archived));
    });

    window.addEventListener('cart-updated', updateCart);
    return () => {
      unsub();
      window.removeEventListener('cart-updated', updateCart);
    };
  }, [user, userProfile]);

  // Close menu & suggestions on outside click / resize
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('resize', close);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
    setBuyerAuth('');
    setMenuOpen(false);
  };

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    setShowSuggestions(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('luxe-search-trigger', { detail: navSearch.trim() }));
    }
    router.push(`/shop?q=${encodeURIComponent(navSearch.trim())}`);
  };

  const matchingSuggestions = navSearch.trim()
    ? productsList.filter(p => p.name.toLowerCase().includes(navSearch.toLowerCase()) || (p.description && p.description.toLowerCase().includes(navSearch.toLowerCase()))).slice(0, 5)
    : [];

  const currentEmail = user?.email || userProfile?.email || buyerAuth;
  const displayName = userProfile?.displayName || user?.displayName || (currentEmail ? currentEmail.split('@')[0] : '');

  const navLinks = [
    { href: '/shop', label: 'Home' },
    { href: '/shop/about', label: 'About' },
    { href: '/shop/contact', label: 'Contact' },
    { href: currentEmail ? '/shop/profile' : '/shop/orders', label: currentEmail ? 'My Account' : 'Orders' },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={`container ${styles.navContent} glass-panel`}>
          <Link href="/shop" className={styles.logo}>
            <Icons.Store />
            <span>LuxeStore</span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Form with Auto-Suggestions */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: '0 1 240px' }}>
            <form onSubmit={handleNavSearchSubmit} style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => {
                  setNavSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search store..."
                style={{
                  width: '100%',
                  padding: '7px 32px 7px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
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
                <Icons.Search style={{ width: '14px', height: '14px' }} />
              </button>
            </form>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && matchingSuggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  zIndex: 300,
                  minWidth: '260px'
                }}
              >
                <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase' }}>
                  Matching Products
                </div>
                {matchingSuggestions.map(p => (
                  <Link
                    key={p.id}
                    href={`/shop/product/${p.id}`}
                    onClick={() => setShowSuggestions(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem' }}>🛍️</span>
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 700 }}>{formatPrice(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Auth + Cart */}
          <div className={`${styles.authButtons} ${styles.desktopAuth}`}>
            {/* Currency Selector Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCurrencyOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '20px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text-main)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                  fontWeight: 600, whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
                title="Change Currency"
                aria-label="Change currency"
              >
                💱 {currency.symbol} {currency.code}
              </button>
              {currencyOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '8px 0',
                  maxHeight: '280px', overflowY: 'auto',
                  zIndex: 200, minWidth: '220px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {ALL_CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 16px', background: c.code === currency.code ? 'var(--surface-hover)' : 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-main)',
                        fontFamily: 'inherit', fontSize: '0.88rem',
                        fontWeight: c.code === currency.code ? 700 : 400
                      }}
                    >
                      {c.symbol} {c.name} ({c.code})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {mounted && currentEmail ? (
              <>
                <Link href="/shop/profile" className={styles.hiUser} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.User style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                  <span>Hi, <strong>{displayName}</strong></span>
                </Link>
                <button onClick={handleLogout} className={styles.loginBtn} title="Sign Out">
                  <Icons.Logout /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.loginBtn}>
                <Icons.User /> Sign In
              </Link>
            )}
            <Link href="/cart" className={`btn-primary ${styles.cartBtn} shine-effect`}>
              <Icons.Cart />
              Cart
              {cartCount > 0 && (
                <span className={`${styles.cartBadge} ${shouldWobble ? 'animate-wobble' : ''}`}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: Cart icon + Hamburger */}
          <div className={styles.mobileRight}>
            <Link href="/cart" className={`btn-primary ${styles.cartBtnMobile} shine-effect`}>
              <Icons.Cart />
              {cartCount > 0 && (
                <span className={`${styles.cartBadge} ${shouldWobble ? 'animate-wobble' : ''}`}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <Link href="/shop" className={styles.logo} onClick={() => setMenuOpen(false)}>
            <Icons.Store /><span>LuxeStore</span>
          </Link>
          <button className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className={styles.drawerLinks}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
