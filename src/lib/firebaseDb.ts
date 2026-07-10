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
} from 'firebase/firestore';
import { db } from './firebaseClient';

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
};

export type StoreSettings = {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
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
  status: 'Pending' | 'Ready';
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

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductsLimited(batchSize: number): Promise<Product[]> {
  const q = query(collection(db, 'products'), orderBy('name'), fbLimit(batchSize));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}


export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
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

export async function placeOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
  const newOrder: Omit<Order, 'id'> = {
    ...order,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
  };
  const ref = await addDoc(collection(db, 'orders'), newOrder);
  const result: Order = { id: ref.id, ...newOrder };

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

export async function markOrderReady(id: string) {
  await updateDoc(doc(db, 'orders', id), {
    status: 'Ready',
    readyDate: new Date().toISOString().split('T')[0],
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

