"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getSettings, StoreSettings } from '@/lib/firebaseDb';

export default function AboutPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const text = settings?.aboutContent || 'Welcome to LuxeStore. We are dedicated to sourcing only the highest quality products from around the globe. Our mission is to provide an unparalleled shopping experience with exceptional customer service.';

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '5rem 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', marginBottom: '1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              About Us
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Learn more about who we are and what drives us</p>
          </div>

          {/* Content Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3rem', backdropFilter: 'blur(12px)', lineHeight: 1.9, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '3rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {text.split('\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
            ))}
          </div>

          {/* Values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: '🏆', title: 'Premium Quality', desc: 'Every product is hand-picked and verified for excellence.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'We ensure your order reaches you swiftly and safely.' },
              { icon: '💎', title: 'Luxury Value', desc: 'Exceptional products at honest, transparent pricing.' },
            ].map(v => (
              <div key={v.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </>
  );
}
