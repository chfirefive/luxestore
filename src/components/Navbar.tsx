"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { getCart } from '@/lib/firebaseDb';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [buyerAuth, setBuyerAuth] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const updateCart = () => {
    const cart = getCart();
    setCartCount(cart.reduce((sum, c) => sum + c.qty, 0));
  };

  useEffect(() => {
    const authEmail = sessionStorage.getItem('buyer_auth');
    if (authEmail) setBuyerAuth(authEmail);
    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => window.removeEventListener('cart-updated', updateCart);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    sessionStorage.removeItem('buyer_auth');
    setBuyerAuth('');
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContent} glass-panel`}>
        <Link href="/shop" className={styles.logo}>
          <Icons.Store />
          <span>LuxeStore</span>
        </Link>

        <div className={styles.navLinks} style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/shop" style={{ textDecoration: 'none', color: 'var(--text-main)', padding: '12px 0', fontWeight: 600 }}>Home</Link>
          <Link href="/shop/about" style={{ textDecoration: 'none', color: 'var(--text-muted)', padding: '12px 0', fontWeight: 500 }}>About</Link>
          <Link href="/shop/contact" style={{ textDecoration: 'none', color: 'var(--text-muted)', padding: '12px 0', fontWeight: 500 }}>Contact</Link>
        </div>

        <div className={styles.authButtons}>
          {buyerAuth ? (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                Hi, <strong style={{ color: 'var(--text-main)' }}>{buyerAuth.split('@')[0]}</strong>
              </span>
              <button onClick={handleLogout} className={styles.loginBtn} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Logout /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              <Icons.User /> Sign In
            </Link>
          )}
          <Link href="/cart" className={`btn-primary ${styles.signupBtn}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <Icons.Cart />
            Cart
            {cartCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
