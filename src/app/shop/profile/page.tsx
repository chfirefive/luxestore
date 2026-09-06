"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { listenToOrdersByEmail, Order, listenToExternalOrdersByEmail, ExternalOrder } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './profile.module.css';
import { useCurrency } from '@/hooks/useCurrency';
import { ALL_CURRENCIES } from '@/lib/currency';
import HoldableProfileAvatar from '@/components/HoldableProfileAvatar';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, logout, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'security'>('orders');
  const [ordersSubTab, setOrdersSubTab] = useState<'store' | 'external'>('store');
  const { currency, setCurrency, formatPrice } = useCurrency();

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [extOrders, setExtOrders] = useState<ExternalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Cancel / Complaint Modal States for profile
  const [cancelModalOrder, setCancelModalOrder] = useState<ExternalOrder | null>(null);
  const [cancelStoreOrder, setCancelStoreOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [complaintModalOrder, setComplaintModalOrder] = useState<ExternalOrder | null>(null);
  const [complaintDetails, setComplaintDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  // Subscribe to Orders & External Orders by email
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

    const unsubscribeExt = listenToExternalOrdersByEmail(userEmail, (userExtOrders) => {
      setExtOrders(userExtOrders);
    });

    return () => {
      unsubscribe();
      unsubscribeExt();
    };
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

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/external-orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cancelModalOrder.id, reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`✅ Order #${cancelModalOrder.id.slice(-6).toUpperCase()} cancelled & automatically forwarded to ${cancelModalOrder.externalStoreName}.`);
        setCancelModalOrder(null);
        setCancelReason('');
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch {
      alert('Network error while cancelling order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelStoreOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancelStoreOrder.id,
          orderData: cancelStoreOrder,
          reason: cancelReason.trim() || 'Cancelled by customer'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`✅ Order #${cancelStoreOrder.id.slice(0, 8)} cancelled. Confirmation email has been sent to ${cancelStoreOrder.email}.`);
        setCancelStoreOrder(null);
        setCancelReason('');
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch {
      alert('Network error while cancelling order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintModalOrder || !complaintDetails.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/external-orders/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: complaintModalOrder.id, details: complaintDetails.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`✅ Complaint for Order #${complaintModalOrder.id.slice(-6).toUpperCase()} filed & automatically forwarded to ${complaintModalOrder.externalStoreName}.`);
        setComplaintModalOrder(null);
        setComplaintDetails('');
      } else {
        alert(data.error || 'Failed to submit complaint.');
      }
    } catch {
      alert('Network error while filing complaint.');
    } finally {
      setActionLoading(false);
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
                <HoldableProfileAvatar initial={initialLetter} size={68} displayName={displayName} />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Order History</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setOrdersSubTab('store')}
                        style={{
                          background: ordersSubTab === 'store' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                          color: ordersSubTab === 'store' ? 'white' : 'var(--text-muted)',
                          border: '1px solid ' + (ordersSubTab === 'store' ? 'transparent' : 'var(--border)'),
                          padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        🏪 Store ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrdersSubTab('external')}
                        style={{
                          background: ordersSubTab === 'external' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                          color: ordersSubTab === 'external' ? 'white' : 'var(--text-muted)',
                          border: '1px solid ' + (ordersSubTab === 'external' ? 'transparent' : 'var(--border)'),
                          padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        🌐 Sourced Goods ({extOrders.length})
                      </button>
                    </div>
                  </div>

                  {actionNotice && (
                    <div style={{
                      background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981',
                      padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span>{actionNotice}</span>
                      <button onClick={() => setActionNotice(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>✕</button>
                    </div>
                  )}

                  {ordersLoading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading your orders...</p>
                  ) : ordersSubTab === 'store' ? (
                    orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Icons.Cart style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Store Orders Found</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven&apos;t placed any direct store orders with this email account yet.</p>
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

                              <div className={styles.orderFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  Shipping to: <strong>{order.address}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {order.status === 'Pending' && (
                                    <button
                                      type="button"
                                      onClick={() => { setCancelStoreOrder(order); setCancelReason(''); }}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      🚫 Cancel Order
                                    </button>
                                  )}
                                  <div className={styles.orderTotal}>
                                    Total: {formatPrice(order.total)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    /* Sourced Goods Tab */
                    extOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Sourced Goods Orders</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven&apos;t ordered items from external marketplaces yet.</p>
                        <button onClick={() => router.push('/shop')} className="btn-primary" style={{ padding: '10px 24px' }}>
                          Explore Store &amp; Marketplace
                        </button>
                      </div>
                    ) : (
                      <div className={styles.ordersList}>
                        {extOrders.map(order => {
                          const isCancelled = order.status === 'Cancelled';
                          const isOrdered = order.status === 'Ordered';
                          const isComplaint = order.status === 'Complaint';
                          const statusColor = isOrdered ? '#10b981' : isCancelled ? '#ef4444' : isComplaint ? '#f59e0b' : '#6366f1';

                          return (
                            <div key={order.id} className={styles.orderCard}>
                              <div className={styles.orderHeader}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px' }}>
                                      via {order.externalStoreName}
                                    </span>
                                    <span className={styles.orderId}>Ref #{order.id.slice(-6).toUpperCase()}</span>
                                  </div>
                                  <h4 style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 600 }}>{order.productTitle}</h4>
                                  <div className={styles.orderDate}>Placed on: {order.date}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                    background: statusColor + '20', color: statusColor, border: '1px solid ' + statusColor + '40',
                                    display: 'inline-block'
                                  }}>
                                    {order.status}
                                  </span>
                                  {order.forwardedToExternal && (
                                    <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                                      ✅ Auto-forwarded
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0' }}>
                                {order.productImageUrl && (
                                  <img src={order.productImageUrl} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                                )}
                                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                                  <a href={order.productUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                                    🔗 Original Product Link
                                  </a>
                                  <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Shipping to: {order.address}
                                  </div>
                                  {order.complaintDetails && (
                                    <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', color: '#fbbf24', fontSize: '0.78rem' }}>
                                      <strong>Complaint:</strong> {order.complaintDetails}
                                    </div>
                                  )}
                                  {order.cancelReason && (
                                    <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#f87171', fontSize: '0.78rem' }}>
                                      <strong>Cancelled:</strong> {order.cancelReason}
                                    </div>
                                  )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                                    {order.currency} {order.ourPrice.toLocaleString()}
                                  </strong>
                                </div>
                              </div>

                              {!isCancelled && (
                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '1rem', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setComplaintModalOrder(order)}
                                    style={{
                                      padding: '6px 14px', borderRadius: '8px',
                                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                                      color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                  >
                                    📢 Automated Complaint
                                  </button>
                                  <button
                                    onClick={() => setCancelModalOrder(order)}
                                    style={{
                                      padding: '6px 14px', borderRadius: '8px',
                                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                      color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                  >
                                    🚫 Request Cancellation
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ─── TAB 2: ADDRESS & PROFILE DETAILS ─── */}
              {activeTab === 'address' && (
                <div>
                  <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', fontWeight: 700, color: '#ffffff' }}>Personal Information & Address</h2>
                  <p style={{ color: '#e2e8f0', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
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

                    {/* Currency Preference */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label htmlFor="currency-select" className={styles.label}>
                        💱 Display Currency
                      </label>
                      <select
                        id="currency-select"
                        value={currency.code}
                        onChange={e => {
                          const selected = ALL_CURRENCIES.find(c => c.code === e.target.value);
                          if (selected) setCurrency(selected);
                        }}
                        className={styles.input}
                        style={{ cursor: 'pointer' }}
                      >
                        {ALL_CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.symbol} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Auto-detected from your location. You can override it here — it will be remembered.
                      </p>
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

      {/* ── Cancel Order Modal ── */}
      {cancelModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: '#ef4444' }}>
              Cancel Sourced Order
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              The system will <strong>automatically email {cancelModalOrder.externalStoreName}&apos;s support team</strong> with your cancellation request.
            </p>
            <form onSubmit={handleCancelSubmit}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Reason for cancellation *
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Changed mind, ordered by mistake..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setCancelModalOrder(null); setCancelReason(''); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  {actionLoading ? 'Forwarding…' : '✓ Confirm & Auto-Forward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Complaint Modal ── */}
      {complaintModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: '#f59e0b' }}>
              File Automated Complaint
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Your complaint will be <strong>automatically dispatched to {complaintModalOrder.externalStoreName}&apos;s support team</strong>.
            </p>
            <form onSubmit={handleComplaintSubmit}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Complaint description *
              </label>
              <textarea
                required
                rows={4}
                value={complaintDetails}
                onChange={e => setComplaintDetails(e.target.value)}
                placeholder="Explain the issue (item damaged, not as described, delayed...)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setComplaintModalOrder(null); setComplaintDetails(''); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#f59e0b', border: 'none', color: 'black', fontWeight: 700, cursor: 'pointer' }}
                >
                  {actionLoading ? 'Dispatching…' : '✓ Dispatch to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Cancel Store Order Modal ── */}
      {cancelStoreOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: '#ef4444' }}>
              Cancel Order #{cancelStoreOrder.id.slice(0, 8)}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Are you sure you want to cancel this order? A cancellation confirmation email will be automatically sent to <strong>{cancelStoreOrder.email}</strong>.
            </p>
            <form onSubmit={handleCancelStoreSubmit}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Changed mind, ordered incorrect product/size..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setCancelStoreOrder(null); setCancelReason(''); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  {actionLoading ? 'Cancelling…' : '✓ Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
