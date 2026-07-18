"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getOrdersByIds, Order } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import Link from 'next/link';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } catch (e) {
        console.error('Error fetching user orders:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title" style={{ fontSize: '2.5rem', margin: 0 }}>Your Orders</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track the progress and status of your active and past orders.</p>
          </div>
          <Link href="/shop" className="btn-primary shine-effect" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Store /> Back to Shop
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderTopColor: 'var(--primary)' }}></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="card animate-scale-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '4rem' }}>📦</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>No Orders Found</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '450px', marginInline: 'auto' }}>
              You haven't placed any orders on this device yet. Start browsing our curated premium items to place your first order.
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
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>#{order.id}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Placed on: <strong>{order.date}</strong></p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: order.status === 'Ready' ? 'rgba(16, 185, 129, 0.15)' : order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: order.status === 'Ready' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                      border: order.status === 'Ready' ? '1px solid rgba(16, 185, 129, 0.3)' : order.status === 'Cancelled' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: order.status === 'Ready' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                        animation: order.status === 'Pending' ? 'pulse 1s infinite alternate' : 'none'
                      }}></span>
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty: {item.qty} × ${item.price.toFixed(2)}</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <div>
                    {order.status === 'Ready' && order.readyDate && (
                      <p style={{ fontSize: '0.85rem', color: '#10b981' }}>
                        ✓ Ready for delivery/pickup since {order.readyDate}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '10px' }}>Total Amount:</span>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>${order.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
