"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Icons } from '@/components/Icons';

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', textAlign: 'center', padding: '4rem 24px' }}>

        <div className="animate-scale-in" style={{ display: 'flex', justifyContent: 'center' }}>
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem' }}>Order Placed! 🎉</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '500px', lineHeight: 1.7 }}>
            Thank you for your purchase! The store owner has been notified and will prepare your order shortly.
          </p>
        </div>

        <div className="animate-slide-up" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.6s' }}>
          <Link href="/shop" className="btn-primary shine-effect" style={{ padding: '14px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Store /> Continue Shopping
          </Link>
          <Link href="/shop" className="shine-effect" style={{ padding: '14px 32px', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)' }}>
            <Icons.Orders /> Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
