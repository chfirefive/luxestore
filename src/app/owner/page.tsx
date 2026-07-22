"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { listenToOrders, Order } from '@/lib/firebaseDb';
import styles from './Orders.module.css';

export default function OwnerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Ready' | 'Cancelled'>('All');

  useEffect(() => {
    const unsub = listenToOrders(data => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleMarkReady = async (orderId: string) => {
    if (busyId) return;
    setBusyId(orderId + '_ready');
    const smtpUser = sessionStorage.getItem('owner_email') || undefined;
    const smtpPass = sessionStorage.getItem('owner_smtp_pass') || undefined;

    try {
      const res = await fetch('/api/orders/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, smtpUser, smtpPass })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed response');
      }
      setOrders(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, status: 'Ready' as const, readyDate: new Date().toISOString().split('T')[0] }
          : o)
      );
    } catch (err) {
      console.error('Failed to mark order ready:', err);
      alert('Failed to update order. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelConfirmed = async (orderId: string) => {
    setConfirmId(null);
    if (busyId) return;
    setBusyId(orderId + '_cancel');
    const smtpUser = sessionStorage.getItem('owner_email') || undefined;
    const smtpPass = sessionStorage.getItem('owner_smtp_pass') || undefined;

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, smtpUser, smtpPass })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed response');
      }
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o)
      );
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Client', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Date', 'Status'],
      ...orders.map(o => [
        o.id, o.client, o.email, o.phone, o.address,
        o.items.map(i => `${i.name}x${i.qty}`).join('; '),
        `$${o.total.toFixed(2)}`, o.date, o.status,
      ]),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = orders.filter(o => o.status === 'Ready').reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  // ─── Last 7 Days Revenue Data ───
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailyStats = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.date === date && o.status !== 'Cancelled');
    const totalSales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const count = dayOrders.length;
    // Format label to MM/DD
    const parts = date.split('-');
    const label = parts[1] && parts[2] ? `${parts[1]}/${parts[2]}` : date;
    return { date, label, totalSales, count };
  });

  const maxDailySales = Math.max(...dailyStats.map(d => d.totalSales), 1);

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'All') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading orders from Firestore...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Orders /> Orders Management
        </h1>
        <button className="btn-primary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Export /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--primary)' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b' },
          { label: 'Cancelled', value: cancelledCount, color: '#ef4444' },
          { label: 'Revenue (Ready)', value: `$${totalRevenue.toFixed(2)}`, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>{stat.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Revenue Chart */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Daily Sales Revenue (Last 7 Days)</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '10px 0 0', position: 'relative' }}>
          {dailyStats.map(stat => {
            const pct = (stat.totalSales / maxDailySales) * 100;
            return (
              <div key={stat.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px', zIndex: 1 }}>
                <div style={{ position: 'relative', width: '32px', height: '120px', display: 'flex', alignItems: 'flex-end' }}>
                  {/* Tooltip on hover */}
                  <div className={styles.chartTooltip} style={{ position: 'absolute', bottom: `${pct + 8}%`, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s, transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    ${stat.totalSales.toFixed(2)} ({stat.count} ord)
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${pct}%`,
                      background: stat.totalSales > 0 ? 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)' : 'var(--border)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const tt = e.currentTarget.previousSibling as HTMLDivElement;
                      if (tt) { tt.style.opacity = '1'; tt.style.transform = 'translateX(-50%) translateY(-4px)'; }
                    }}
                    onMouseLeave={(e) => {
                      const tt = e.currentTarget.previousSibling as HTMLDivElement;
                      if (tt) { tt.style.opacity = '0'; tt.style.transform = 'translateX(-50%)'; }
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Section */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        {(['All', 'Pending', 'Ready', 'Cancelled'] as const).map(tab => {
          const isActive = statusFilter === tab;
          const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                color: isActive ? 'white' : 'var(--text-muted)',
                border: '1px solid ' + (isActive ? 'transparent' : 'var(--border)'),
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Order ID</th>
              <th className={styles.th}>Client</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Items</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Notes</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No orders match this status filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const s = (order.status || '').toString().trim().toLowerCase();
                const isPending = s === 'pending';
                const isReady = s === 'ready';
                const isCancelled = s === 'cancelled';
                const isLoadingReady = busyId === order.id + '_ready';
                const isLoadingCancel = busyId === order.id + '_cancel';
                const showConfirm = confirmId === order.id;

                return (
                  <tr key={order.id} className={styles.row}>
                    <td className={styles.td}><strong>{order.id.slice(-6).toUpperCase()}</strong></td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600 }}>{order.client}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.email}</div>
                    </td>
                    <td className={styles.td}>{order.phone}</td>
                    <td className={styles.td}>
                      <div style={{ fontSize: '0.85rem' }}>{order.items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
                    </td>
                    <td className={styles.td}><strong>${order.total.toFixed(2)}</strong></td>
                    <td className={styles.td}>
                      {order.notes ? (
                        <span title={order.notes} style={{ display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f59e0b', fontStyle: 'italic', fontSize: '0.85rem', cursor: 'help' }}>
                          📝 {order.notes}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>{order.date}</td>
                    <td className={styles.td}>
                      <span className={isReady ? styles.statusReady : isCancelled ? styles.statusCancelled : styles.statusPending}>
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {showConfirm ? (
                        /* Inline cancel confirmation */
                        <div className={styles.confirmBox}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                            Cancel &amp; notify customer?
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className={styles.confirmYes}
                              onClick={() => handleCancelConfirmed(order.id)}
                              disabled={!!busyId}
                            >
                              {isLoadingCancel ? '...' : '✓ Yes'}
                            </button>
                            <button
                              className={styles.confirmNo}
                              onClick={() => setConfirmId(null)}
                              disabled={!!busyId}
                            >
                              ✕ No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {/* ✅ Ready */}
                          <button
                            className={isPending ? styles.actionBtn : styles.actionBtnDisabled}
                            onClick={() => { if (isPending && !busyId) handleMarkReady(order.id); }}
                            disabled={!isPending || !!busyId}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            {isLoadingReady ? '...' : <><Icons.Check /> Ready</>}
                          </button>

                          {/* 🚫 Cancel */}
                          <button
                            className={isPending ? styles.actionCancelBtn : styles.actionBtnDisabled}
                            onClick={() => {
                              if (isPending && !busyId) setConfirmId(order.id);
                            }}
                            disabled={!isPending || !!busyId}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            🚫 Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
