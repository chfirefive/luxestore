"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { getOwnerPassword } from '@/lib/firebaseDb';

export default function OwnerLogin() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('owner_email') || '');
      setSmtpPass(localStorage.getItem('owner_smtp_pass') || '');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      const storedPassword = await getOwnerPassword();
      if (password === storedPassword) {
        sessionStorage.setItem('owner_auth', 'true');
        sessionStorage.setItem('owner_email', email.trim());
        sessionStorage.setItem('owner_smtp_pass', smtpPass.trim());
        
        localStorage.setItem('owner_email', email.trim());
        localStorage.setItem('owner_smtp_pass', smtpPass.trim());
        
        window.location.replace('/owner');
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch {
      setError('Could not verify password. Check your connection and try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 60%), radial-gradient(circle at bottom left, rgba(236,72,153,0.1), transparent 60%)',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2.5rem', textAlign: 'center' }}>

        <div style={{ width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', margin: '0 auto 1.5rem' }}>
          <Icons.Shield />
        </div>

        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Owner Portal</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Enter your credentials to access the store dashboard.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          
          {/* Admin Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="adminPassword" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Lock /> Admin Password
            </label>
            <input
              id="adminPassword"
              name="adminPassword"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                border: error ? '1px solid #ef4444' : '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-main)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>✉️ Setup Real Email Notifications (Optional)</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              Provide your Gmail details to automatically send status emails. If left empty, test emails will still print to the server console.
            </p>
          </div>

          {/* Optional Gmail address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="ownerEmail" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Gmail Address
            </label>
            <input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-main)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Optional App Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="ownerSmtpPass" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Gmail App Password (16-char)
            </label>
            <input
              id="ownerSmtpPass"
              name="ownerSmtpPass"
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="•••• •••• •••• ••••"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-main)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isAuthenticating}
            style={{ padding: '14px', fontSize: '1rem', opacity: isAuthenticating ? 0.75 : 1, cursor: isAuthenticating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
            {isAuthenticating
              ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Verifying...</>
              : <><Icons.Lock /> Access Dashboard</>}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Gateway
          </a>
        </div>
      </div>
    </div>
  );
}
