"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import { getOwnerPassword, saveOwnerPassword } from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function PasswordChangePage() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const storedPassword = await getOwnerPassword();
      if (current !== storedPassword) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }

      await saveOwnerPassword(newPass);
      // Log out to re-login with new password
      sessionStorage.removeItem('owner_auth');
      router.replace('/owner-login');
    } catch {
      setError('Failed to update password. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Lock /> Change Password
        </h1>
      </div>
      <div className="card" style={{ padding: '2rem', maxWidth: '500px', margin: '2rem auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="current" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Current Password</label>
            <input id="current" name="current" type="password" value={current} onChange={e => setCurrent(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="new" style={{ fontSize: '0.9rem', fontWeight: 600 }}>New Password</label>
            <input id="new" name="new" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="confirm" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Confirm New Password</label>
            <input id="confirm" name="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
          </div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px' }}>{error}</div>
          )}
          <button type="submit" disabled={isLoading} className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}>
            <Icons.Check /> {isLoading ? 'Updating...' : 'Update Password'}
          </button>
          <button type="button" disabled={isLoading} className="btn-secondary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1, background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px' }}
            onClick={async () => {
              setIsLoading(true);
              try {
                await saveOwnerPassword('admin123');
                alert('Password reset to default (admin123). Please log in again.');
                sessionStorage.removeItem('owner_auth');
                router.replace('/owner-login');
              } catch (e) {
                console.error(e);
                setError('Failed to reset password.');
              } finally {
                setIsLoading(false);
              }
            }}>
            Reset to Default
          </button>
        </form>
      </div>
    </div>
  );
}
