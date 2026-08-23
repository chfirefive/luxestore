"use client";

import { useState } from 'react';

interface ExternalProduct {
  title: string;
  price: number;
  imageUrl: string;
  link: string;
  source: string;
  supportEmail: string;
  ourPrice: number;
  commissionRate: number;
}

interface ExternalOrderModalProps {
  product: ExternalProduct | null;
  onClose: () => void;
}

export default function ExternalOrderModal({ product, onClose }: ExternalOrderModalProps) {
  const [step, setStep] = useState<'form' | 'success' | 'loading'>('form');
  const [form, setForm] = useState({ client: '', email: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState('');

  if (!product) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.client.trim()) errs.client = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.trim().length < 7) errs.phone = 'Valid phone required';
    if (!form.address.trim()) errs.address = 'Delivery address required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep('loading');

    try {
      const res = await fetch('/api/external-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: form.client.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
          productTitle: product.title,
          productUrl: product.link,
          productImageUrl: product.imageUrl,
          externalStoreName: product.source,
          externalSupportEmail: product.supportEmail,
          externalPrice: product.price,
          ourPrice: product.ourPrice,
          commissionRate: product.commissionRate,
          currency: 'PKR',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        try {
          const stored = localStorage.getItem('luxe_external_order_ids');
          const ids = stored ? JSON.parse(stored) : [];
          ids.push(data.orderId);
          localStorage.setItem('luxe_external_order_ids', JSON.stringify(ids));
          if (!localStorage.getItem('buyer_auth_email')) {
            localStorage.setItem('buyer_auth_email', form.email.trim().toLowerCase());
          }
        } catch (e) {
          console.error(e);
        }
        setStep('success');
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
        setStep('form');
      }
    } catch {
      alert('Network error. Please try again.');
      setStep('form');
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: '6px',
  };

  const commission = Math.round((product.ourPrice - product.price));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          position: 'relative',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'var(--surface-hover)', border: '1px solid var(--border)',
            borderRadius: '50%', width: '32px', height: '32px',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close"
        >✕</button>

        {step === 'success' ? (
          /* ── Success State ── */
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginBottom: '10px' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '16px' }}>
              We've received your order for <strong style={{ color: 'var(--text-main)' }}>{product.title}</strong>.<br />
              A confirmation email has been sent to your inbox.
            </p>
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#6366f1' }}>
                #{orderId.slice(-6).toUpperCase()}
              </p>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              💡 <strong>To cancel or file a complaint</strong> later, go to your <em>My Orders</em> page and find this external order.
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '20px', padding: '12px 32px' }}
            >
              Done
            </button>
          </div>

        ) : step === 'loading' ? (
          /* ── Loading State ── */
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '48px', height: '48px', border: '4px solid var(--border)',
              borderTop: '4px solid #6366f1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Placing your order…</p>
          </div>

        ) : (
          /* ── Order Form ── */
          <>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '20px', padding: '5px 14px', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 700,
                color: '#a5b4fc',
              }}>
                🌐 External Marketplace Order
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>
                Order via LuxeStore
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                We'll source this product for you and deliver it to your door.
              </p>
            </div>

            {/* Product Summary */}
            <div style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              background: 'var(--background)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '14px', marginBottom: '22px',
            }}>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {product.title}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  via {product.source}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    PKR {product.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#6366f1' }}>
                    PKR {product.ourPrice.toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, background: 'rgba(99,102,241,0.15)',
                    color: '#a5b4fc', borderRadius: '20px', padding: '2px 8px',
                  }}>
                    +{Math.round(product.commissionRate * 100)}% service fee (PKR {commission.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label htmlFor="ext-client" style={labelStyle}>Full Name *</label>
                  <input
                    id="ext-client"
                    type="text"
                    value={form.client}
                    onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                    style={{ ...fieldStyle, borderColor: errors.client ? '#ef4444' : undefined }}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {errors.client && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.client}</p>}
                </div>
                <div>
                  <label htmlFor="ext-phone" style={labelStyle}>Phone *</label>
                  <input
                    id="ext-phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={{ ...fieldStyle, borderColor: errors.phone ? '#ef4444' : undefined }}
                    placeholder="+92 3XX XXXXXXX"
                    autoComplete="tel"
                  />
                  {errors.phone && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.phone}</p>}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="ext-email" style={labelStyle}>Email Address *</label>
                <input
                  id="ext-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ ...fieldStyle, borderColor: errors.email ? '#ef4444' : undefined }}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.email}</p>}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="ext-address" style={labelStyle}>Delivery Address *</label>
                <textarea
                  id="ext-address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical', borderColor: errors.address ? '#ef4444' : undefined }}
                  placeholder="Full delivery address including city and postal code"
                  autoComplete="street-address"
                />
                {errors.address && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.address}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="ext-notes" style={labelStyle}>Order Notes (optional)</label>
                <input
                  id="ext-notes"
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={fieldStyle}
                  placeholder="Color, size, variant preferences, etc."
                />
              </div>

              {/* Disclaimer */}
              <div style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', fontSize: '0.78rem',
                color: '#fbbf24', lineHeight: 1.6,
              }}>
                ⚠️ <strong>COD:</strong> You pay when the product is delivered. If you need to cancel or have a complaint, go to <em>My Orders</em> — it will be automatically forwarded to {product.source}.
              </div>

              <button
                type="submit"
                className="btn-primary shine-effect"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
              >
                🛒 Place External Order — PKR {product.ourPrice.toLocaleString()}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
