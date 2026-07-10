"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getCart, removeFromCart, updateCartQty, clearCart, placeOrder, CartItem } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'checkout' | 'placing'>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [formError, setFormError] = useState('');

  const refreshCart = () => setCart(getCart());

  useEffect(() => {
    refreshCart();
    window.addEventListener('cart-updated', refreshCart);
    return () => window.removeEventListener('cart-updated', refreshCart);
  }, []);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormError('');
    setStep('placing');

    try {
      await placeOrder({
        client: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        notes: form.notes || undefined,
        items: cart,
        total,
      });
      clearCart();
      router.push('/shop/order-success');
    } catch (err) {
      setFormError('Failed to place your order. Please check your internet connection.');
      setStep('checkout');
    }
  };

  if (cart.length === 0 && step === 'cart') {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '6rem 24px', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '5rem' }}>🛒</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your cart is empty</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add items from the store and they will appear here.</p>
          <a href="/shop" className="btn-primary" style={{ padding: '14px 32px' }}>Continue Shopping</a>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 24px', minHeight: '80vh' }}>
        <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>
          {step === 'cart' ? 'Your Cart' : 'Checkout'}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left: Cart Items or Checkout Form */}
          <div>
            {step === 'cart' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map(item => (
                  <div key={item.productId} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', background: 'var(--surface-hover)', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Store />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>${item.price.toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button onClick={() => updateCartQty(item.productId, item.qty - 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>−</button>
                      <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, item.qty + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>${(item.price * item.qty).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Delivery Information</h2>
                <form id="checkout-form" onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@email.com' },
                    { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 555 123 4567' },
                    { label: 'Delivery Address', key: 'address', type: 'text', placeholder: '123 Main Street, City' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label htmlFor={key} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</label>
                      <input
                        id={key}
                        name={key}
                        type={type}
                        required
                        placeholder={placeholder}
                        value={form[key as keyof CheckoutForm]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem' }}
                      />
                    </div>
                  ))}
                  {/* Optional Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Additional Notes
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.85rem' }}>(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any special instructions for the owner? E.g. preferred delivery time, gift wrapping, colour preference, measurements..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical', lineHeight: 1.6 }}
                    />
                  </div>
                  {formError && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{formError}</p>}
                </form>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Subtotal</span><span style={{ color: 'var(--text-muted)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Shipping</span><span>${shipping.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem' }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button className="btn-primary" onClick={() => setStep('checkout')} style={{ width: '100%', marginTop: '1.5rem', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Proceed to Checkout <Icons.ArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={step === 'placing'}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: step === 'placing' ? 0.7 : 1 }}
              >
                {step === 'placing' ? 'Placing Order...' : <><Icons.Check /> Place Order</>}
              </button>
            )}

            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} style={{ width: '100%', marginTop: '0.75rem', padding: '10px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                ← Back to Cart
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
