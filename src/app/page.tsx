"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import styles from './gateway.module.css';

export default function Gateway() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={styles.gatewayContainer}>
      {/* Background Image with Dark Glass Overlay */}
      <div className={styles.bgImageOverlay} />

      {/* Header Logo */}
      <div className={styles.logoHeader}>
        <div style={{ color: 'var(--primary)' }}><Icons.Store /></div>
        <h1 className={styles.logoText} style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit', display: 'inline-block' }}>LuxeStore</h1>
      </div>

      {/* 3D Flip Card */}
      <div className={styles.flipScene}>
        <div className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`}>

          {/* ─── FRONT: Buyer Card ─── */}
          <div className={`${styles.flipFace} ${styles.flipFront} glass-panel`}>
            <div
              className={styles.iconWrap}
              onDoubleClick={() => setFlipped(true)}
              title="Double-click to switch to Owner portal"
              style={{ cursor: 'pointer' }}
            >
              <Icons.Buyer />
            </div>
            <h2 className={styles.title}>I am a Buyer</h2>
            <p className={styles.description}>
              Discover curated luxury goods, high-end electronics, and premium fashion. Sign in for personalized recommendations.
            </p>
            <div className={styles.actionGroup}>
              <Link href="/login" className="btn-primary shine-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <Icons.User /> Sign In to Account
              </Link>
              <Link href="/shop" className={styles.btnSkip}>
                Browse Store <Icons.ArrowRight />
              </Link>
            </div>
            <p className={styles.hintText}>Double-tap the icon above to access the owner portal</p>
          </div>

          {/* ─── BACK: Owner Card ─── */}
          <div className={`${styles.flipFace} ${styles.flipBack} glass-panel`}>
            <div
              className={`${styles.iconWrap} ${styles.ownerIconWrap}`}
              onDoubleClick={() => setFlipped(false)}
              title="Double-click to go back to Buyer"
              style={{ cursor: 'pointer' }}
            >
              <Icons.Owner />
            </div>
            <h2 className={styles.title}>I am the Owner</h2>
            <p className={styles.description}>
              Access the store dashboard to manage orders, view client reports, configure menus, and update settings.
            </p>
            <div className={styles.actionGroup}>
              <Link href="/owner-login" className="btn-primary shine-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Icons.Shield /> Owner Sign In
              </Link>
              <button onClick={() => setFlipped(false)} className={styles.btnSkip}>
                ← Back to Buyer
              </button>
            </div>
            <p className={styles.hintText}>Double-tap the icon above to switch back to buyer</p>
          </div>

        </div>
      </div>
    </div>
  );
}
