"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import styles from './OwnerLayout.module.css';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('owner_auth');
    if (auth === 'true') {
      setAuthed(true);
    } else {
      router.replace('/owner-login');
    }
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('owner_auth');
    window.location.href = '/owner-login';
  };

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying access...</p>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className={styles.ownerContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div style={{ color: 'white' }}><Icons.Store /></div>
          LuxeStore
        </div>
        <nav className={styles.navLinks}>
          <Link href="/owner" className={styles.link}>
            <Icons.Orders /> Orders
          </Link>
          <Link href="/owner/products" className={styles.link}>
            <Icons.Plus /> Add Goods
          </Link>
          <Link href="/owner/clients" className={styles.link}>
            <Icons.Clients /> Clients & Reports
          </Link>
          <Link href="/owner/settings" className={styles.link}>
            <Icons.Settings /> Site Settings
          </Link>
          <Link href="/owner/menus" className={styles.link}>
            <Icons.Menu /> Menu Management
          </Link>
          <Link href="/owner/password" className={styles.link}>
            <Icons.Lock /> Password
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <Icons.Logout /> Logout
          </button>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
