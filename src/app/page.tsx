import Link from 'next/link';
import { Icons } from '@/components/Icons';
import styles from './gateway.module.css';

export default function Gateway() {
  return (
    <div className={styles.gatewayContainer}>

      {/* Logo */}
      <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: 'var(--primary)' }}><Icons.Store /></div>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LuxeStore</span>
      </div>

      <div className={styles.gatewayCard}>

        {/* Buyer Panel */}
        <div className={styles.panel}>
          <div className={styles.iconWrap}>
            <Icons.Buyer />
          </div>
          <h2 className={styles.title}>I am a Buyer</h2>
          <p className={styles.description}>
            Discover curated luxury goods, high-end electronics, and premium fashion. Sign in for personalized recommendations.
          </p>
          <div className={styles.actionGroup}>
            <Link href="/login" className={`btn-primary ${styles.btnPrimary}`}>
              <Icons.User /> Sign In to Account
            </Link>
            <Link href="/shop" className={styles.btnSkip}>
              Browse Store <Icons.ArrowRight />
            </Link>
          </div>
        </div>

        {/* Owner Panel */}
        <div className={styles.panel}>
          <div className={styles.iconWrap}>
            <Icons.Owner />
          </div>
          <h2 className={styles.title}>I am the Owner</h2>
          <p className={styles.description}>
            Access the store dashboard to manage orders, view client reports, and configure your storefront menus.
          </p>
          <div className={styles.actionGroup}>
            <Link href="/owner-login" className={`btn-primary ${styles.btnPrimary}`}>
              <Icons.Shield /> Owner Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
