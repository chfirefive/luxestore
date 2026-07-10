"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Icons } from '@/components/Icons';

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', textAlign: 'center', padding: '4rem 24px' }}>

        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.5s ease',
          boxShadow: '0 0 40px rgba(16,185,129,0.4)'
        }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem' }}>Order Placed! 🎉</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '500px', lineHeight: 1.7 }}>
            Thank you for your purchase! The store owner has been notified and will prepare your order shortly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/shop" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Store /> Continue Shopping
          </Link>
          <Link href="/shop" style={{ padding: '14px 32px', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Orders /> Back to Home
          </Link>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
