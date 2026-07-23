"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { getCart } from '@/lib/firebaseDb';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const [buyerAuth, setBuyerAuth] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [shouldWobble, setShouldWobble] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const updateCart = () => {
    const cart = getCart();
    const count = cart.reduce((sum, c) => sum + c.qty, 0);
    setCartCount(count);
    setShouldWobble(true);
    setTimeout(() => setShouldWobble(false), 600);
  };

  useEffect(() => {
    setMounted(true);
    const authEmail = user?.email || userProfile?.email || (typeof window !== 'undefined' ? sessionStorage.getItem('buyer_auth') : '');
    if (authEmail) setBuyerAuth(authEmail);
    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => window.removeEventListener('cart-updated', updateCart);
  }, [user, userProfile]);

  // Close menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
    setBuyerAuth('');
    setMenuOpen(false);
  };

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

          {/* Desktop Auth + Cart */}
          <div className={`${styles.authButtons} ${styles.desktopAuth}`}>
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

        <div className={styles.drawerFooter}>
          {mounted && currentEmail ? (
            <>
              <Link href="/shop/profile" className={styles.drawerUser} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                Signed in as <strong>{displayName}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '2px' }}>Manage Profile & Orders →</div>
              </Link>
              <button onClick={handleLogout} className={`${styles.loginBtn} ${styles.drawerLogout}`}>
                <Icons.Logout /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
              <Icons.User /> Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
