"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getSettings, StoreSettings } from '@/lib/firebaseDb';

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [sent, setSent] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const email = settings?.contactEmail || 'support@luxestore.com';
  const phone = settings?.contactPhone || '+1 (555) 123-4567';
  const address = settings?.contactAddress || '123 Luxury Avenue, Beverly Hills, CA 90210';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '5rem 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', marginBottom: '1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16l.42.92z"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Contact Us
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We&apos;d love to hear from you. Reach out anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2.5rem', alignItems: 'start' }}>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ),
                  label: 'Email Support',
                  value: email,
                  color: 'rgba(99,102,241,0.12)',
                  accent: 'var(--primary)',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16l.42.92z"/></svg>
                  ),
                  label: 'Phone Support',
                  value: phone,
                  color: 'rgba(236,72,153,0.12)',
                  accent: 'var(--secondary)',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ),
                  label: 'Our Address',
                  value: address,
                  color: 'rgba(16,185,129,0.12)',
                  accent: '#10b981',
                },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: item.color, color: item.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Form */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-muted)' }}>We&apos;ll get back to you as soon as possible.</p>
                  <button onClick={() => { setSent(false); setMsgForm({ name: '', email: '', message: '' }); }} style={{ marginTop: '1.5rem', padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send us a Message</h2>
                  <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { label: 'Your Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                      { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
                    ].map(f => (
                      <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor={f.key} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.label}</label>
                        <input
                          id={f.key}
                          name={f.key}
                          type={f.type}
                          required
                          placeholder={f.placeholder}
                          value={msgForm[f.key as 'name' | 'email']}
                          onChange={e => setMsgForm(m => ({ ...m, [f.key]: e.target.value }))}
                          style={{ padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Message</label>
                      <textarea
                        required
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        value={msgForm.message}
                        onChange={e => setMsgForm(m => ({ ...m, message: e.target.value }))}
                        style={{ padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
