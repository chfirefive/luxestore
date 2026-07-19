"use client";

import { useState } from 'react';
import { Icons } from '@/components/Icons';
import { getOwnerPassword } from '@/lib/firebaseDb';

export default function OwnerLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      const storedPassword = await getOwnerPassword();
      if (password === storedPassword) {
        sessionStorage.setItem('owner_auth', 'true');
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
      background: 'radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 60%), radial-gradient(circle at bottom left, rgba(236,72,153,0.12), transparent 60%)',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2.5rem', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          color: 'white', margin: '0 auto 1.5rem',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
        }}>
          <Icons.Shield />
        </div>

        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Owner Portal</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Enter your admin password to access the store dashboard.
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
              placeholder="Enter your password"
              required
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                border: error ? '1px solid #ef4444' : '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-main)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isAuthenticating}
            style={{ padding: '14px', fontSize: '1rem', opacity: isAuthenticating ? 0.75 : 1, cursor: isAuthenticating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.25rem' }}
          >
            {isAuthenticating
              ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Verifying...</>
              : <><Icons.Lock /> Access Dashboard</>}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
