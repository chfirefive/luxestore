"use client";

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/Icons';
import { getOrders, markOrderReady, Order } from '@/lib/firebaseDb';
import styles from './Orders.module.css';

export default function OwnerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleMarkReady = async (id: string) => {
    await markOrderReady(id);
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, status: 'Ready' as const, readyDate: new Date().toISOString().split('T')[0] } : o)
    );
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Client', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Date', 'Status'],
      ...orders.map(o => [
        o.id, o.client, o.email, o.phone, o.address,
        o.items.map(i => `${i.name}×${i.qty}`).join('; '),
        `$${o.total.toFixed(2)}`, o.date, o.status
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = orders.filter(o => o.status === 'Ready').reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders from Firestore...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Orders /> Orders Management
        </h1>
        <button className="btn-primary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Export /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--primary)' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b' },
          { label: 'Revenue (Ready)', value: `$${totalRevenue.toFixed(2)}`, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={styles.tableContainer}>
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
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={9} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet. Orders placed by buyers will appear here.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className={styles.row}>
                  <td className={styles.td}><strong>{order.id.slice(-6).toUpperCase()}</strong></td>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 600 }}>{order.client}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.email}</div>
                  </td>
                  <td className={styles.td}>{order.phone}</td>
                  <td className={styles.td}>
                    <div style={{ fontSize: '0.85rem' }}>
                      {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                    </div>
                  </td>
                  <td className={styles.td}><strong>${order.total.toFixed(2)}</strong></td>
                  <td className={styles.td}>
                    {order.notes ? (
                      <span title={order.notes} style={{ display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f59e0b', fontStyle: 'italic', fontSize: '0.85rem', cursor: 'help' }}>📝 {order.notes}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>{order.date}</td>
                  <td className={styles.td}>
                    <span className={order.status === 'Ready' ? styles.statusReady : styles.statusPending}>
                      {order.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {order.status === 'Pending' ? (
                      <button className={styles.actionBtn} onClick={() => handleMarkReady(order.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Check /> Mark Ready
                      </button>
                    ) : (
                      <button className={styles.actionBtnDisabled} disabled style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Check /> Done
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
