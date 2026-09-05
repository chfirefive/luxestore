"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import {
  getSettings,
  saveSettings,
  StoreSettings,
  getTrustBadges,
  saveTrustBadges,
  TrustBadge,
  HeroSlide,
  TickerItem
} from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function SettingsPage() {
  const [settings, setLocalSettings] = useState<StoreSettings | null>(null);
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active section tab in Settings
  const [activeTab, setActiveTab] = useState<'banners' | 'ticker' | 'storefront' | 'guarantees'>('banners');

  useEffect(() => {
    Promise.all([getSettings(), getTrustBadges()]).then(([sets, bdgs]) => {
      setLocalSettings(sets);
      setBadges(bdgs);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await Promise.all([
        saveSettings(settings),
        saveTrustBadges(badges)
      ]);
      setSuccess('All storefront settings updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: any) => {
    if (settings) setLocalSettings({ ...settings, [field]: value });
  };

  const handleBadgeChange = (id: string, field: keyof TrustBadge, value: any) => {
    setBadges(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // ── Hero Slide Handlers ──
  const handleSlideChange = (id: string, field: keyof HeroSlide, value: any) => {
    if (!settings) return;
    const updated = (settings.heroSlides || []).map(s => s.id === id ? { ...s, [field]: value } : s);
    setLocalSettings({ ...settings, heroSlides: updated });
  };

  const handleAddSlide = () => {
    if (!settings) return;
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Luxury Timepiece Slide',
      subtitle: 'Engineered with sapphire crystal, surgical steel, and automatic precision.',
      desktopImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2000&q=85',
      mobileImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
      buttonText: 'Explore Collection',
      buttonLink: '#shop-now',
      active: true
    };
    setLocalSettings({ ...settings, heroSlides: [...(settings.heroSlides || []), newSlide] });
  };

  const handleDeleteSlide = (id: string) => {
    if (!settings) return;
    setLocalSettings({
      ...settings,
      heroSlides: (settings.heroSlides || []).filter(s => s.id !== id)
    });
  };

  // ── Ticker Items Handlers ──
  const handleTickerChange = (id: string, field: keyof TickerItem, value: any) => {
    if (!settings) return;
    const updated = (settings.tickerItems || []).map(t => t.id === id ? { ...t, [field]: value } : t);
    setLocalSettings({ ...settings, tickerItems: updated });
  };

  const handleAddTickerItem = () => {
    if (!settings) return;
    const newItem: TickerItem = {
      id: `ticker-${Date.now()}`,
      text: 'Special Complimentary Gift Box on Orders Above Rs. 20,000',
      icon: 'gift',
      active: true
    };
    setLocalSettings({ ...settings, tickerItems: [...(settings.tickerItems || []), newItem] });
  };

  const handleDeleteTickerItem = (id: string) => {
    if (!settings) return;
    setLocalSettings({
      ...settings,
      tickerItems: (settings.tickerItems || []).filter(t => t.id !== id)
    });
  };

  if (loading || !settings) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings from Firestore...</div>;
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Settings /> Storefront & Display Control Center
        </h1>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            boxShadow: '0 4px 14px rgba(214, 178, 105, 0.4)'
          }}
        >
          <Icons.Check /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeTab === 'banners' ? '1px solid #D6B269' : '1px solid var(--border)',
            background: activeTab === 'banners' ? 'rgba(214, 178, 105, 0.15)' : 'var(--surface)',
            color: activeTab === 'banners' ? '#D6B269' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🖼️ Hero Banner Carousel ({(settings.heroSlides || []).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ticker')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeTab === 'ticker' ? '1px solid #D6B269' : '1px solid var(--border)',
            background: activeTab === 'ticker' ? 'rgba(214, 178, 105, 0.15)' : 'var(--surface)',
            color: activeTab === 'ticker' ? '#D6B269' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⚡ Marquee Trust Ticker ({(settings.tickerItems || []).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('storefront')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeTab === 'storefront' ? '1px solid #D6B269' : '1px solid var(--border)',
            background: activeTab === 'storefront' ? 'rgba(214, 178, 105, 0.15)' : 'var(--surface)',
            color: activeTab === 'storefront' ? '#D6B269' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🏪 Product Display & General Content
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guarantees')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeTab === 'guarantees' ? '1px solid #D6B269' : '1px solid var(--border)',
            background: activeTab === 'guarantees' ? 'rgba(214, 178, 105, 0.15)' : 'var(--surface)',
            color: activeTab === 'guarantees' ? '#D6B269' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🛡️ Footer Guarantees & Badges
        </button>
      </div>

      {/* ── TAB 1: HERO BANNER CAROUSEL ── */}
      {activeTab === 'banners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(214, 178, 105, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🖼️</span> Hero Banner Slideshow
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '6px 0 0' }}>
                  Manage the full-width luxury hero slides shown on the storefront home page. Each slide supports high-res desktop & mobile images, call-to-actions, and headings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #D6B269', color: '#D6B269' }}
              >
                <Icons.Plus /> Add New Slide
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {(settings.heroSlides || []).map((slide, idx) => (
                <div
                  key={slide.id}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: slide.active ? 'var(--surface)' : 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#D6B269', background: 'rgba(214, 178, 105, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                        Slide #{idx + 1}
                      </span>
                      <strong style={{ fontSize: '1rem' }}>{slide.title || 'Untitled Slide'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={slide.active}
                          onChange={e => handleSlideChange(slide.id, 'active', e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: '#D6B269', cursor: 'pointer' }}
                        />
                        Active on Store
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                      >
                        <Icons.Trash /> Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Headline Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={e => handleSlideChange(slide.id, 'title', e.target.value)}
                          placeholder="e.g. Precision In Every Second"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Subtitle Description</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={e => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                          placeholder="Slide description..."
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Button Text</label>
                          <input
                            type="text"
                            value={slide.buttonText}
                            onChange={e => handleSlideChange(slide.id, 'buttonText', e.target.value)}
                            placeholder="e.g. Shop Timepieces"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Button Target Link</label>
                          <input
                            type="text"
                            value={slide.buttonLink}
                            onChange={e => handleSlideChange(slide.id, 'buttonLink', e.target.value)}
                            placeholder="#shop-now or /shop/category/men"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image URLs & Previews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Desktop Image URL (1920x1080 recommended)
                        </label>
                        <input
                          type="url"
                          value={slide.desktopImage}
                          onChange={e => handleSlideChange(slide.id, 'desktopImage', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Mobile Image URL (Optional, 800x1000 recommended)
                        </label>
                        <input
                          type="url"
                          value={slide.mobileImage || ''}
                          onChange={e => handleSlideChange(slide.id, 'mobileImage', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                        />
                      </div>

                      {slide.desktopImage && (
                        <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={slide.desktopImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#D6B269', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>
                            Banner Preview
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MARQUEE TRUST TICKER ── */}
      {activeTab === 'ticker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(214, 178, 105, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>⚡</span> Continuous Marquee Trust Ticker
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '6px 0 0' }}>
                  Configure the smooth moving top bar highlighting Free Delivery, 1-Year Warranty, Swiss Precision, and custom notices.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.showTicker !== false}
                    onChange={e => handleChange('showTicker', e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#D6B269', cursor: 'pointer' }}
                  />
                  Enable Ticker on Store
                </label>
                <button
                  type="button"
                  onClick={handleAddTickerItem}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #D6B269', color: '#D6B269' }}
                >
                  <Icons.Plus /> Add Highlight
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(settings.tickerItems || []).map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: item.active ? 'var(--surface)' : 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#D6B269', fontSize: '0.85rem' }}>
                    #{idx + 1}
                  </span>

                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={item.icon}
                      onChange={e => handleTickerChange(item.id, 'icon', e.target.value as any)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', width: '100%' }}
                    >
                      <option value="truck">🚚 Delivery Truck</option>
                      <option value="shield">🛡️ Shield / Warranty</option>
                      <option value="clock">⌚ Timepiece / Craft</option>
                      <option value="star">⭐ Genuine / Star</option>
                      <option value="gift">🎁 Gift / Special</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={item.text}
                    onChange={e => handleTickerChange(item.id, 'text', e.target.value)}
                    placeholder="e.g. Nationwide Free Delivery"
                    style={{ flex: 1, minWidth: '220px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={e => handleTickerChange(item.id, 'active', e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#D6B269', cursor: 'pointer' }}
                    />
                    Active
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteTickerItem(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PRODUCT DISPLAY & GENERAL CONTENT ── */}
      {activeTab === 'storefront' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Store style={{ width: '20px', height: '20px' }} /> Watch Presentation & Pricing Controls
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Compare At Price Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface-hover)'
              }}>
                <div>
                  <label htmlFor="showCompareToggle" style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block', color: 'var(--text-main)' }}>
                    🏷️ Show Strike-Through Compare Prices & Discount Tags
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    When enabled, products display a realistic crossed-out original price and a high-converting "SAVE 20%" badge.
                  </span>
                </div>
                <input
                  id="showCompareToggle"
                  type="checkbox"
                  checked={settings.showComparePrice !== false}
                  onChange={e => handleChange('showComparePrice', e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#D6B269' }}
                />
              </div>

              {/* Compare At Price Multiplier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="compareAtMultiplier" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Compare-At Price Multiplier
                </label>
                <input
                  id="compareAtMultiplier"
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.5"
                  value={settings.compareAtMultiplier || 1.25}
                  onChange={e => handleChange('compareAtMultiplier', parseFloat(e.target.value) || 1.25)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Default is 1.25 (displays a 20% discount off original price, e.g. Rs. 10,000 product shows Rs. 12,500 crossed out).
                </span>
              </div>

              {/* Flash Deals Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface-hover)'
              }}>
                <div>
                  <label htmlFor="showFlashDealsToggle" style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block', color: 'var(--text-main)' }}>
                    ⚡ Show Flash Deals Countdown Section
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Turn ON to display the Flash Deals countdown timer and discounted items on the store home page.
                  </span>
                </div>
                <input
                  id="showFlashDealsToggle"
                  type="checkbox"
                  checked={settings.showFlashDeals !== false}
                  onChange={e => handleChange('showFlashDeals', e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#D6B269' }}
                />
              </div>

              {/* Announcement Bar Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface-hover)'
              }}>
                <div>
                  <label htmlFor="showAnnouncementToggle" style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block', color: 'var(--text-main)' }}>
                    📢 Show Promotional Announcement Bar
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Shows top headline text across all storefront pages.
                  </span>
                </div>
                <input
                  id="showAnnouncementToggle"
                  type="checkbox"
                  checked={settings.showAnnouncement !== false}
                  onChange={e => handleChange('showAnnouncement', e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#D6B269' }}
                />
              </div>

              {settings.showAnnouncement !== false && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 0.5rem' }}>
                  <label htmlFor="announcementText" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Announcement Text</label>
                  <input
                    id="announcementText"
                    type="text"
                    value={settings.announcementText || ''}
                    onChange={e => handleChange('announcementText', e.target.value)}
                    placeholder="WELCOME! COD AVAILABLE | FREE DELIVERY..."
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* General Information & Contact */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Phone style={{ width: '20px', height: '20px' }} /> Store Details & Contact
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Store Headline / Brand Tagline</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={e => handleChange('heroTitle', e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>About Page Content</label>
                <textarea
                  rows={3}
                  value={settings.aboutContent}
                  onChange={e => handleChange('aboutContent', e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={e => handleChange('contactEmail', e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={e => handleChange('contactPhone', e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Physical Boutique Address</label>
                <input
                  type="text"
                  value={settings.contactAddress}
                  onChange={e => handleChange('contactAddress', e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: FOOTER GUARANTEES & BADGES ── */}
      {activeTab === 'guarantees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Shield style={{ width: '20px', height: '20px' }} /> Guarantees & Trust Badges
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Enable, disable, or customize the guarantees displayed on the buyer landing page.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {badges.map(badge => (
                <div key={badge.id} style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: badge.active ? 'rgba(214, 178, 105, 0.05)' : 'var(--background)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: '#D6B269', letterSpacing: '0.05em' }}>
                      {badge.id === 'delivery' && '🚚 Express Delivery'}
                      {badge.id === 'returns' && '🔄 Hassle-Free Returns'}
                      {badge.id === 'secure' && '🛡️ Authenticity Guarantee'}
                      {badge.id === 'helpline' && '📞 Dedicated Support'}
                    </span>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={badge.active}
                        onChange={e => handleBadgeChange(badge.id, 'active', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#D6B269', cursor: 'pointer' }}
                      />
                      Active
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input
                      type="text"
                      value={badge.title}
                      onChange={e => handleBadgeChange(badge.id, 'title', e.target.value)}
                      placeholder="Badge Title"
                      disabled={!badge.active}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.9rem', opacity: badge.active ? 1 : 0.6 }}
                    />
                    <input
                      type="text"
                      value={badge.desc}
                      onChange={e => handleBadgeChange(badge.id, 'desc', e.target.value)}
                      placeholder="Badge Description"
                      disabled={!badge.active}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.85rem', opacity: badge.active ? 1 : 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Notification */}
      {success && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          padding: '1rem 1.75rem', background: '#10b981', color: 'white',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 700, boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
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
