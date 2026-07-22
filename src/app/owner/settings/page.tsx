"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { getSettings, saveSettings, StoreSettings, getTrustBadges, saveTrustBadges, TrustBadge } from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function SettingsPage() {
  const [settings, setLocalSettings] = useState<StoreSettings | null>(null);
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSettings(), getTrustBadges()]).then(([sets, bdgs]) => {
      setLocalSettings(sets);
      setBadges(bdgs);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await Promise.all([
        saveSettings(settings),
        saveTrustBadges(badges)
      ]);
      setSuccess('Site settings and trust badges updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: string) => {
    if (settings) setLocalSettings({ ...settings, [field]: value });
  };

  const handleBadgeChange = (id: string, field: keyof TrustBadge, value: any) => {
    setBadges(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  if (loading || !settings) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings from Firestore...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Settings /> Site Content & Guarantees
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start', maxWidth: '1200px' }}>
        
        {/* Left: General Storefront Content Settings */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Store style={{ width: '20px', height: '20px' }} /> General Content
          </h2>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="heroTitle" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hero Title</label>
              <input id="heroTitle" name="heroTitle" type="text" value={settings.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="heroSubtitle" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hero Subtitle</label>
              <textarea id="heroSubtitle" name="heroSubtitle" value={settings.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} required rows={2} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="aboutContent" style={{ fontSize: '0.9rem', fontWeight: 600 }}>About Page Content</label>
              <textarea id="aboutContent" name="aboutContent" value={settings.aboutContent} onChange={e => handleChange('aboutContent', e.target.value)} required rows={4} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="contactEmail" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contact Email</label>
                <input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="contactPhone" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contact Phone</label>
                <input id="contactPhone" name="contactPhone" type="tel" value={settings.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="contactAddress" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contact Address</label>
              <input id="contactAddress" name="contactAddress" type="text" value={settings.contactAddress} onChange={e => handleChange('contactAddress', e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="socialFacebook" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Facebook Link</label>
                <input id="socialFacebook" name="socialFacebook" type="url" value={settings.socialFacebook || ''} onChange={e => handleChange('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="socialInstagram" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Instagram Link</label>
                <input id="socialInstagram" name="socialInstagram" type="url" value={settings.socialInstagram || ''} onChange={e => handleChange('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="socialTwitter" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Twitter Link</label>
                <input id="socialTwitter" name="socialTwitter" type="url" value={settings.socialTwitter || ''} onChange={e => handleChange('socialTwitter', e.target.value)} placeholder="https://twitter.com/..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
              <Icons.Check /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right: Homepage Trust Badges Guarantees */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Shield style={{ width: '20px', height: '20px' }} /> Guarantees & Badges
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Enable, disable, or customize the guarantees displayed on the buyer landing page.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {badges.map(badge => (
                <div key={badge.id} style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: badge.active ? 'rgba(99,102,241,0.03)' : 'var(--background)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                      {badge.id === 'delivery' && '🚚 Delivery'}
                      {badge.id === 'returns' && '🔄 Returns'}
                      {badge.id === 'secure' && '🛡️ Security'}
                      {badge.id === 'helpline' && '📞 Support'}
                    </span>
                    <label htmlFor={`badge-active-${badge.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input
                        id={`badge-active-${badge.id}`}
                        name={`badge-active-${badge.id}`}
                        type="checkbox"
                        checked={badge.active}
                        onChange={e => handleBadgeChange(badge.id, 'active', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      Active
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input
                      id={`badge-title-${badge.id}`}
                      name={`badge-title-${badge.id}`}
                      type="text"
                      aria-label="Badge title"
                      value={badge.title}
                      onChange={e => handleBadgeChange(badge.id, 'title', e.target.value)}
                      placeholder="Badge Title"
                      required
                      disabled={!badge.active}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.9rem', opacity: badge.active ? 1 : 0.6 }}
                    />
                    <input
                      id={`badge-desc-${badge.id}`}
                      name={`badge-desc-${badge.id}`}
                      type="text"
                      aria-label="Badge description"
                      value={badge.desc}
                      onChange={e => handleBadgeChange(badge.id, 'desc', e.target.value)}
                      placeholder="Badge Description"
                      required
                      disabled={!badge.active}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.85rem', opacity: badge.active ? 1 : 0.6 }}
                    />
                  </div>
                </div>
              ))}

              <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
                <Icons.Check /> {saving ? 'Saving...' : 'Save Guarantees'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {success && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          padding: '1rem 1.5rem', background: '#10b981', color: 'white',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 600, boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <Icons.Check style={{ stroke: 'white' }} /> {success}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
