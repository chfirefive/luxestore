"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getOrdersByIds, Order, getExternalOrdersByIds, ExternalOrder } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import Link from 'next/link';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [extOrders, setExtOrders] = useState<ExternalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'store' | 'external'>('store');

  // Cancel / Complaint Modal States
  const [cancelModalOrder, setCancelModalOrder] = useState<ExternalOrder | null>(null);
  const [cancelStoreOrder, setCancelStoreOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [complaintModalOrder, setComplaintModalOrder] = useState<ExternalOrder | null>(null);
  const [complaintDetails, setComplaintDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchUserOrders = async () => {
    try {
      const storedIds = localStorage.getItem('luxe_order_ids');
      if (storedIds) {
        const ids = JSON.parse(storedIds) as string[];
        if (ids.length > 0) {
          const fetched = await getOrdersByIds(ids);
          setOrders(fetched);
        }
      }
      const storedExtIds = localStorage.getItem('luxe_external_order_ids');
      if (storedExtIds) {
        const extIds = JSON.parse(storedExtIds) as string[];
        if (extIds.length > 0) {
          const fetchedExt = await getExternalOrdersByIds(extIds);
          setExtOrders(fetchedExt);
        }
      }
    } catch (e) {
      console.error('Error fetching user orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

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
        await fetchUserOrders();
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
        setActionNotice(`✅ Order #${cancelStoreOrder.id.slice(-6).toUpperCase()} has been cancelled. An email notification has been dispatched to ${cancelStoreOrder.email}.`);
        setCancelStoreOrder(null);
        setCancelReason('');
        await fetchUserOrders();
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
        await fetchUserOrders();
      } else {
        alert(data.error || 'Failed to submit complaint.');
      }
    } catch {
      alert('Network error while filing complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title" style={{ fontSize: '2.5rem', margin: 0 }}>Your Orders</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track, cancel, or file complaints on all your store and sourced items.</p>
          </div>
          <Link href="/shop" className="btn-primary shine-effect" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Store /> Back to Shop
          </Link>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('store')}
            style={{
              background: activeTab === 'store' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
              color: activeTab === 'store' ? 'white' : 'var(--text-muted)',
              border: '1px solid ' + (activeTab === 'store' ? 'transparent' : 'var(--border)'),
              padding: '10px 22px', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            🏪 Store Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('external')}
            style={{
              background: activeTab === 'external' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
              color: activeTab === 'external' ? 'white' : 'var(--text-muted)',
              border: '1px solid ' + (activeTab === 'external' ? 'transparent' : 'var(--border)'),
              padding: '10px 22px', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            🌐 External Marketplace ({extOrders.length})
          </button>
        </div>

        {actionNotice && (
          <div style={{
            background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981',
            padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderTopColor: 'var(--primary)' }}></span>
          </div>
        ) : activeTab === 'store' ? (
          orders.length === 0 ? (
            <div className="card animate-scale-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '4rem' }}>📦</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>No Store Orders Found</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '450px', marginInline: 'auto' }}>
                You haven&apos;t placed any direct store orders on this device yet.
              </p>
              <Link href="/shop" className="btn-primary shine-effect" style={{ padding: '12px 30px', textDecoration: 'none' }}>
                Browse Store
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {orders.map((order, idx) => (
                <div key={order.id} className="card animate-scale-in" style={{ padding: '2rem', animationDelay: `${idx * 0.08}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>#{order.id.slice(-6).toUpperCase()}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Placed on: <strong>{order.date}</strong></p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                      <span style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                        background: order.status === 'Ready' ? 'rgba(16, 185, 129, 0.15)' : order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: order.status === 'Ready' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                        border: order.status === 'Ready' ? '1px solid rgba(16, 185, 129, 0.3)' : order.status === 'Cancelled' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {order.items.map(item => (
                      <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', background: 'var(--surface-hover)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Store />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty: {item.qty} × PKR {item.price.toLocaleString()}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>PKR {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Shipping to: <strong>{order.address}</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {order.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => { setCancelStoreOrder(order); setCancelReason(''); }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🚫 Cancel Order
                        </button>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '10px' }}>Total Amount:</span>
                        <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>PKR {order.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* External Marketplace Orders List */
          extOrders.length === 0 ? (
            <div className="card animate-scale-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '4rem' }}>🌐</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>No External Orders</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '450px', marginInline: 'auto' }}>
                You haven&apos;t ordered any sourced goods from external marketplaces (Amazon, AliExpress, Daraz) yet.
              </p>
              <Link href="/shop" className="btn-primary shine-effect" style={{ padding: '12px 30px', textDecoration: 'none' }}>
                Search &amp; Source Items
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {extOrders.map((order, idx) => {
                const isCancelled = order.status === 'Cancelled';
                const isComplaint = order.status === 'Complaint';
                const isOrdered = order.status === 'Ordered';
                const statusColor = isOrdered ? '#10b981' : isCancelled ? '#ef4444' : isComplaint ? '#f59e0b' : '#6366f1';

                return (
                  <div key={order.id} className="card animate-scale-in" style={{ padding: '2rem', animationDelay: `${idx * 0.08}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '3px 8px', borderRadius: '6px' }}>
                            via {order.externalStoreName}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ref #{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: '4px 0' }}>{order.productTitle}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed on: <strong>{order.date}</strong></p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{
                          padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                          background: statusColor + '20', color: statusColor, border: '1px solid ' + statusColor + '40',
                        }}>
                          {order.status}
                        </span>
                        {order.forwardedToExternal && (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                            ✅ Auto-forwarded to {order.externalStoreName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {order.productImageUrl && (
                        <img src={order.productImageUrl} alt="" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px' }} />
                      )}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <a href={order.productUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                          🔗 View Original Product Page
                        </a>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                          Delivery to: <strong>{order.address}</strong>
                        </p>
                        {order.complaintDetails && (
                          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', fontSize: '0.82rem', color: '#fbbf24' }}>
                            <strong>Your Complaint:</strong> {order.complaintDetails}
                          </div>
                        )}
                        {order.cancelReason && (
                          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontSize: '0.82rem', color: '#f87171' }}>
                            <strong>Cancellation Reason:</strong> {order.cancelReason}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Charged</div>
                        <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
                          {order.currency} {order.ourPrice.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Actions: Auto-Cancel & Auto-Complaint */}
                    {!isCancelled && (
                      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setComplaintModalOrder(order)}
                          style={{
                            padding: '8px 16px', borderRadius: '10px',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          📢 File Automated Complaint
                        </button>
                        <button
                          onClick={() => setCancelModalOrder(order)}
                          style={{
                            padding: '8px 16px', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
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

      {/* ── Cancel Order Modal ── */}
      {cancelModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: '#ef4444' }}>
              Cancel External Order
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              When you cancel, the system will <strong>automatically email {cancelModalOrder.externalStoreName}&apos;s support team</strong> with your order cancellation request.
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
                placeholder="e.g. Changed mind, ordered by mistake, found alternative..."
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
              File Complaint on Sourced Item
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Your complaint will be <strong>automatically dispatched to {complaintModalOrder.externalStoreName}&apos;s customer support</strong> with your order reference.
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
                placeholder="Explain the issue (item damaged, not as described, delayed, missing parts...)"
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
              Cancel Order #{cancelStoreOrder.id.slice(-6).toUpperCase()}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Are you sure you want to cancel this order? An automatic cancellation confirmation email will be sent to <strong>{cancelStoreOrder.email}</strong>.
            </p>
            <form onSubmit={handleCancelStoreSubmit}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Changed mind, ordered incorrect size/model..."
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
