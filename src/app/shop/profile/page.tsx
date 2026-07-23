"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { listenToOrdersByEmail, Order } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './profile.module.css';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, logout, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'security'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Address Form State
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('buyer_auth_email') || sessionStorage.getItem('buyer_auth');
      if (!savedEmail) {
        router.push('/login');
      }
    }
  }, [loading, user, router]);

  // Sync profile data to form state when userProfile updates
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
      setCity(userProfile.city || '');
      setPostalCode(userProfile.postalCode || '');
    } else if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [userProfile, user]);

  // Subscribe to Orders by email
  useEffect(() => {
    const userEmail = user?.email || userProfile?.email || (typeof window !== 'undefined' ? localStorage.getItem('buyer_auth_email') || sessionStorage.getItem('buyer_auth') : '');
    if (!userEmail) {
      setOrdersLoading(false);
      return;
    }

    const unsubscribe = listenToOrdersByEmail(userEmail, (userOrders) => {
      setOrders(userOrders);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileData({
        displayName,
        phone,
        address,
        city,
        postalCode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/shop');
  };

  const email = user?.email || userProfile?.email || (typeof window !== 'undefined' ? sessionStorage.getItem('buyer_auth') : '');
  const initialLetter = (displayName || email || 'U').charAt(0).toUpperCase();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container} style={{ textAlign: 'center', paddingTop: '160px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading user profile...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className="container">
          <div className={styles.profileCard}>

            {/* Header Banner */}
            <div className={styles.headerBanner}>
              <div className={styles.userInfoGroup}>
                <div className={styles.avatarCircle}>{initialLetter}</div>
                <div>
                  <h1 className={styles.userName}>{displayName || email?.split('@')[0]}</h1>
                  <p className={styles.userEmail}>
                    <Icons.Mail style={{ width: '16px', height: '16px' }} /> {email}
                  </p>
                  <div className={styles.badgeMember}>
                    <Icons.Check style={{ width: '14px', height: '14px' }} /> Verified Luxe Member
                  </div>
                </div>
              </div>

              <div className={styles.headerActions}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <Icons.Logout style={{ width: '18px', height: '18px' }} /> Sign Out
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Icons.Cart style={{ width: '18px', height: '18px' }} />
                My Orders ({orders.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'address' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('address')}
              >
                <Icons.MapPin style={{ width: '18px', height: '18px' }} />
                Shipping & Address
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Icons.Shield style={{ width: '18px', height: '18px' }} />
                Account Security
              </button>
            </div>

            {/* Tab Contents */}
            <div className={styles.tabContent}>

              {/* ─── TAB 1: MY ORDERS ─── */}
              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>Order History</h2>
                  {ordersLoading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading your orders...</p>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Icons.Cart style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Orders Found</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven&apos;t placed any orders with this email account yet.</p>
                      <button onClick={() => router.push('/shop')} className="btn-primary" style={{ padding: '10px 24px' }}>
                        Start Shopping Now
                      </button>
                    </div>
                  ) : (
                    <div className={styles.ordersList}>
                      {orders.map(order => {
                        let statusClass = styles.statusPending;
                        if (order.status === 'Ready') statusClass = styles.statusReady;
                        if (order.status === 'Cancelled') statusClass = styles.statusCancelled;

                        return (
                          <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                              <div>
                                <span className={styles.orderId}>Order #{order.id.slice(0, 8)}</span>
                                <div className={styles.orderDate}>Placed on: {order.date}</div>
                              </div>
                              <span className={`${styles.statusBadge} ${statusClass}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className={styles.orderItems}>
                              {order.items.map((item, i) => (
                                <div key={i} className={styles.orderItemRow}>
                                  <div>
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
                                      x{item.qty}
                                    </span>
                                  </div>
                                  <span>${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className={styles.orderFooter}>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Shipping to: <strong>{order.address}</strong>
                              </div>
                              <div className={styles.orderTotal}>
                                Total: ${order.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: ADDRESS & PROFILE DETAILS ─── */}
              {activeTab === 'address' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>Personal Information & Address</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Save your default shipping address and phone number for faster 1-click checkout.
                  </p>

                  <form onSubmit={handleSaveProfile} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="displayName" className={styles.label}>Full Name</label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className={styles.input}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="phone" className={styles.label}>Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={styles.input}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label htmlFor="address" className={styles.label}>Street Address</label>
                      <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className={styles.input}
                        placeholder="123 Luxury Ave, Apt 4B"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="city" className={styles.label}>City / State</label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className={styles.input}
                        placeholder="New York, NY"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="postalCode" className={styles.label}>Postal / Zip Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        className={styles.input}
                        placeholder="10001"
                      />
                    </div>

                    <div className={styles.fullWidth} style={{ marginTop: '0.5rem' }}>
                      <button type="submit" disabled={saving} className={`btn-primary ${styles.saveBtn}`}>
                        {saving ? 'Saving Changes...' : 'Save Profile & Address'}
                      </button>
                      {saveSuccess && (
                        <span style={{ color: '#10b981', fontWeight: 600, marginLeft: '1rem', fontSize: '0.9rem' }}>
                          ✓ Saved successfully!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* ─── TAB 3: ACCOUNT SECURITY ─── */}
              {activeTab === 'security' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>Account Security</h2>
                  <div style={{ background: 'rgba(30,41,59,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <Icons.Shield style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>Authentication Provider</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Signed in via <strong>{user?.providerData[0]?.providerId || 'Firebase Secure Auth'}</strong>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Your email address (<strong>{email}</strong>) is verified and secured by Firebase Authentication.
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
