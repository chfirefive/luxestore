// Firestore data layer — replaces mockDb.ts for all persistent data
// Cart stays in localStorage (per-device, no user account needed)

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  categorySlug: string;
  imageUrl?: string;
  description: string;
  archived?: boolean;
  stock: number;
};

export type StoreSettings = {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
};

export type TrustBadge = {
  id: string; // 'delivery' | 'returns' | 'secure' | 'helpline'
  title: string;
  desc: string;
  active: boolean;
};

export type Subscriber = {
  id: string;
  email: string;
  date: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
};

export type Order = {
  id: string;
  client: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Ready' | 'Cancelled';
  readyDate?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastOrder: string;
  date: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ─── DEFAULTS (seeded on first load if Firestore is empty) ──────────────────

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Electronics', slug: 'electronics', active: true },
  { name: 'Fashion', slug: 'fashion', active: true },
  { name: 'Home & Living', slug: 'home-living', active: true },
  { name: 'Sports', slug: 'sports', active: true },
  { name: 'Books', slug: 'books', active: true },
  { name: 'Toys', slug: 'toys', active: true },
  { name: 'Groceries', slug: 'groceries', active: true },
  { name: 'Automotive', slug: 'automotive', active: true },
];

const DEFAULT_SETTINGS: StoreSettings = {
  heroTitle: 'Elevate Your Lifestyle.',
  heroSubtitle: 'Discover curated luxury goods, high-end electronics, and premium fashion designed for the modern connoisseur.',
  aboutContent: 'Welcome to LuxeStore. We are dedicated to sourcing only the highest quality products from around the globe.',
  contactEmail: 'support@luxestore.com',
  contactPhone: '+1 (555) 123-4567',
  contactAddress: '123 Luxury Avenue, Beverly Hills, CA 90210',
  socialFacebook: 'https://facebook.com',
  socialInstagram: 'https://instagram.com',
  socialTwitter: 'https://twitter.com',
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  if (snap.empty) {
    // Seed defaults
    for (const cat of DEFAULT_CATEGORIES) {
      await addDoc(collection(db, 'categories'), cat);
    }
    const seeded = await getDocs(collection(db, 'categories'));
    return seeded.docs.map(d => ({ id: d.id, ...d.data() } as Category));
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const ref = await addDoc(collection(db, 'categories'), cat);
  return { id: ref.id, ...cat };
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>) {
  await updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}

export function listenToCategories(callback: (categories: Category[]) => void) {
  return onSnapshot(collection(db, 'categories'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
  }, (error) => console.error('Categories listener error:', error));
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, stock: data.stock ?? 0 } as Product;
  });
}

export async function getProductsLimited(batchSize: number): Promise<Product[]> {
  const q = query(collection(db, 'products'), orderBy('name'), fbLimit(batchSize));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, stock: data.stock ?? 0 } as Product;
  });
}


export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { id: snap.id, ...data, stock: data.stock ?? 0 } as Product;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const ref = await addDoc(collection(db, 'products'), product);
  return { id: ref.id, ...product };
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
  await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

export function listenToProducts(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'products'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data(), stock: d.data().stock ?? 0 } as Product)));
  }, (error) => console.error('Products listener error:', error));
}

export function listenToProductsLimited(batchSize: number, callback: (products: Product[]) => void) {
  const q = query(collection(db, 'products'), orderBy('name'), fbLimit(batchSize));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data(), stock: d.data().stock ?? 0 } as Product)));
  }, (error) => console.error('Products limited listener error:', error));
}

// ─── STORE SETTINGS ──────────────────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'store'));
    if (!snap.exists()) {
      await setDoc(doc(db, 'settings', 'store'), DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return snap.data() as StoreSettings;
  } catch (e) {
    // If the client is offline or Firestore can't be reached, fall back to defaults
    console.warn('Firestore getSettings failed, returning default settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: StoreSettings) {
  await setDoc(doc(db, 'settings', 'store'), settings);
}

export function listenToSettings(callback: (settings: StoreSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'store'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as StoreSettings);
    } else {
      callback(DEFAULT_SETTINGS);
    }
  }, (error) => console.error('Settings listener error:', error));
}

// ─── OWNER PASSWORD ──────────────────────────────────────────────────────────

export async function getOwnerPassword(): Promise<string> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'ownerAuth'));
    if (!snap.exists()) {
      await setDoc(doc(db, 'settings', 'ownerAuth'), { password: 'admin123' });
      return 'admin123';
    }
    return (snap.data() as { password: string }).password;
  } catch (e) {
    console.warn('Failed to fetch owner password, falling back to default:', e);
    return 'admin123';
  }
}

export async function saveOwnerPassword(password: string) {
  await setDoc(doc(db, 'settings', 'ownerAuth'), { password });
}

// ─── CART (stays in localStorage — per device) ───────────────────────────────

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('luxe_cart');
  return stored ? JSON.parse(stored) : [];
}

export function addToCart(product: Product) {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const existing = cart.find(c => c.productId === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty: 1,
    });
  }
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromCart(productId: string) {
  if (typeof window === 'undefined') return;
  const cart = getCart().filter(c => c.productId !== productId);
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function updateCartQty(productId: string, qty: number) {
  if (typeof window === 'undefined') return;
  const cart = getCart()
    .map(c => c.productId === productId ? { ...c, qty } : c)
    .filter(c => c.qty > 0);
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('luxe_cart');
  window.dispatchEvent(new Event('cart-updated'));
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export function listenToOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
  }, (error) => console.error('Orders listener error:', error));
}

export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  if (!ids || ids.length === 0) return [];
  const orders: Order[] = [];
  for (const id of ids) {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        orders.push({ id: snap.id, ...snap.data() } as Order);
      }
    } catch (e) {
      console.error('Failed to fetch order details for id ' + id, e);
    }
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
}

export async function checkPendingOrders(email: string, phone: string): Promise<boolean> {
  try {
    const snap = await getDocs(query(collection(db, 'orders'), where('status', '==', 'Pending')));
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.trim();

    return snap.docs.some(doc => {
      const data = doc.data();
      const dbEmail = (data.email || '').trim().toLowerCase();
      const dbPhone = (data.phone || '').trim();
      return dbEmail === sanitizedEmail || dbPhone === sanitizedPhone;
    });
  } catch (e) {
    console.error('Failed to check pending orders:', e);
    return false;
  }
}

export async function placeOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
  const newOrder: Omit<Order, 'id'> = {
    ...order,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
  };
  const ref = await addDoc(collection(db, 'orders'), newOrder);
  const result: Order = { id: ref.id, ...newOrder };

  // Save order ID in localStorage for tracking
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('luxe_order_ids');
      const ids = existing ? JSON.parse(existing) : [];
      if (!ids.includes(ref.id)) {
        ids.push(ref.id);
        localStorage.setItem('luxe_order_ids', JSON.stringify(ids));
      }
    } catch (e) {
      console.error('Failed to save order ID to localStorage', e);
    }
  }

  // Decrement product stock in Firestore
  for (const item of order.items) {
    try {
      const prodRef = doc(db, 'products', item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const currentStock = prodSnap.data().stock ?? 0;
        const newStock = Math.max(0, currentStock - item.qty);
        await updateDoc(prodRef, { stock: newStock });
      }
    } catch (err) {
      console.error('Failed to decrement stock for product ' + item.productId, err);
    }
  }

  // Also log the client
  await addClient({
    name: order.client,
    email: order.email,
    phone: order.phone,
    address: order.address,
    lastOrder: ref.id,
    date: newOrder.date,
  });

  return result;
}

export async function sendStatusEmail(email: string, clientName: string, orderId: string, status: 'Ready' | 'Cancelled', total: number, date: string) {
  try {
    const shortId = orderId.substring(orderId.length - 6).toUpperCase();
    const titleColor = status === 'Ready' ? '#10b981' : '#ef4444';
    const statusText = status === 'Ready' ? 'Confirmed & Ready! 🎉' : 'Cancelled ❌';
    const statusMessage = status === 'Ready'
      ? 'Good news! Your order has been confirmed by the store owner and is prepared for pickup or delivery.'
      : 'We regret to inform you that your order has been cancelled by the store owner. If you have any questions, please contact support.';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">LuxeStore</h1>
        </div>
        
        <h2 style="font-size: 20px; color: ${titleColor}; text-align: center; font-weight: 600; margin-bottom: 20px;">
          Order #${shortId} Status Update: ${statusText}
        </h2>
        
        <p style="font-size: 16px; color: #f8fafc; line-height: 1.6;">
          Hello <strong>${clientName}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
          ${statusMessage}
        </p>

        <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #f8fafc; font-size: 16px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Order Reference:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f8fafc;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Date Placed:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f8fafc;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 15px; font-weight: bold;">Total Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #6366f1; font-size: 16px;">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #334155; padding-top: 20px;">
          Thank you for choosing LuxeStore.<br/>
          This is an automated status update email notification.
        </p>
      </div>
    `;

    // Try client-side send call
    if (typeof window !== 'undefined') {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `LuxeStore Order #${shortId} Status Update: ${status}`,
          html: htmlContent
        })
      });
    }
  } catch (e) {
    console.error('Failed to trigger status notification email:', e);
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
  } catch (err) {
    console.error('Failed to get order:', err);
    return null;
  }
}

export async function markOrderReady(id: string) {
  await updateDoc(doc(db, 'orders', id), {
    status: 'Ready',
    readyDate: new Date().toISOString().split('T')[0],
  });
}

export async function cancelOrder(id: string) {
  await updateDoc(doc(db, 'orders', id), {
    status: 'Cancelled',
  });
}

// ─── USER PROFILES ───────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      await updateDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

export function listenToOrdersByEmail(email: string, callback: (orders: Order[]) => void) {
  if (!email) return () => {};
  const sanitized = email.trim().toLowerCase();
  const q = query(
    collection(db, 'orders'),
    where('email', '==', sanitized)
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    // Sort in memory by date descending
    orders.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    callback(orders);
  }, (error) => {
    console.error('Error listening to user orders by email:', error);
    callback([]);
  });
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const snap = await getDocs(query(collection(db, 'clients'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
}

export async function addClient(client: Omit<Client, 'id'>) {
  // Avoid duplicate emails — update if exists
  const snap = await getDocs(
    query(collection(db, 'clients'), where('email', '==', client.email))
  );
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, client);
  } else {
    await addDoc(collection(db, 'clients'), client);
  }
}

// ─── TRUST BADGES ────────────────────────────────────────────────────────────

const DEFAULT_BADGES: TrustBadge[] = [
  { id: 'delivery', title: 'Free Delivery', desc: 'Free worldwide delivery on orders over $150', active: true },
  { id: 'returns', title: 'Easy Returns', desc: '30-day money back guarantee, no questions asked', active: true },
  { id: 'secure', title: 'Secure Payment', desc: 'Fully encrypted secure payment gateways', active: true },
  { id: 'helpline', title: '24/7 Helpline', desc: 'Continuous round-the-clock support for query answers', active: true },
];

export async function getTrustBadges(): Promise<TrustBadge[]> {
  try {
    const ref = doc(db, 'settings', 'trustBadges');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { list: DEFAULT_BADGES });
      return DEFAULT_BADGES;
    }
    return snap.data().list as TrustBadge[];
  } catch (e) {
    // Offline fallback – return the default badge list
    console.warn('Firestore getTrustBadges failed, returning default badges:', e);
    return DEFAULT_BADGES;
  }
}

export async function saveTrustBadges(badges: TrustBadge[]) {
  const ref = doc(db, 'settings', 'trustBadges');
  await setDoc(ref, { list: badges });
}

export function listenToTrustBadges(callback: (badges: TrustBadge[]) => void) {
  return onSnapshot(doc(db, 'settings', 'trustBadges'), (snap) => {
    if (snap.exists()) {
      callback(snap.data().list as TrustBadge[]);
    } else {
      callback(DEFAULT_BADGES);
    }
  }, (error) => console.error('Trust badges listener error:', error));
}

// ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string): Promise<void> {
  const sanitizedEmail = email.trim().toLowerCase();
  if (!sanitizedEmail) return;

  const q = query(collection(db, 'subscribers'), where('email', '==', sanitizedEmail));
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, 'subscribers'), {
      email: sanitizedEmail,
      date: new Date().toISOString().split('T')[0],
    });
  }
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const q = query(collection(db, 'subscribers'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
}

