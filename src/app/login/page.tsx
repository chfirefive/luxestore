"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import Navbar from '@/components/Navbar';
import styles from './login.module.css';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      sessionStorage.setItem('buyer_auth', email);
      router.push('/shop');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem('buyer_auth', result.user.email || '');
      router.push('/shop');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={`glass-panel ${styles.loginCard}`}>
          <h1 className={`title ${styles.title}`}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to access your orders and wishlists.'
              : 'Join LuxeStore to start shopping premium goods.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                color: '#ef4444', padding: '10px 14px', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary ${styles.submitBtn}`}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading
                ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <button
            className={styles.socialBtn}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px', flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
