export type Category = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics', slug: 'electronics', active: true },
  { id: 2, name: 'Fashion', slug: 'fashion', active: true },
  { id: 3, name: 'Home & Living', slug: 'home-living', active: true },
  { id: 4, name: 'Sports', slug: 'sports', active: true },
  { id: 5, name: 'Books', slug: 'books', active: true },
  { id: 6, name: 'Toys', slug: 'toys', active: true },
  { id: 7, name: 'Groceries', slug: 'groceries', active: true },
  { id: 8, name: 'Automotive', slug: 'automotive', active: true },
];

export function getCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const stored = localStorage.getItem('mock_categories');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_categories', JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_categories', JSON.stringify(categories));
}

// ---- PRODUCTS RELATIONAL DATA ----
export type Product = {
  id: number;
  name: string;
  price: number;
  categorySlug: string;
  imageUrl?: string;
  imageBase64?: string;
  description: string;
  archived?: boolean;
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Premium Watch', price: 299.99, categorySlug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500', description: 'A sleek, luxury watch.', archived: false },
  { id: 2, name: 'MacBook Air', price: 1199.00, categorySlug: 'electronics', description: 'Powerful laptop for professionals. (No image provided)', archived: false },
];

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  const stored = localStorage.getItem('mock_products');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

export function saveProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_products', JSON.stringify(products));
}

// ---- STORE SETTINGS RELATIONAL DATA ----
export type StoreSettings = {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

const DEFAULT_SETTINGS: StoreSettings = {
  heroTitle: 'Elevate Your Lifestyle.',
  heroSubtitle: 'Discover curated luxury goods, high-end electronics, and premium fashion designed for the modern connoisseur.',
  aboutContent: 'Welcome to LuxeStore. We are dedicated to sourcing only the highest quality products from around the globe. Our mission is to provide an unparalleled shopping experience with exceptional customer service.',
  contactEmail: 'support@luxestore.com',
  contactPhone: '+1 (555) 123-4567',
  contactAddress: '123 Luxury Avenue, Beverly Hills, CA 90210'
};

export function getSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem('mock_settings');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_settings', JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StoreSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_settings', JSON.stringify(settings));
}

// ---- CART DATA ----
export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
};

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('mock_cart');
  return stored ? JSON.parse(stored) : [];
}

export function addToCart(product: Product) {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const existing = cart.find(c => c.productId === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty: 1 });
  }
  localStorage.setItem('mock_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromCart(productId: number) {
  if (typeof window === 'undefined') return;
  const cart = getCart().filter(c => c.productId !== productId);
  localStorage.setItem('mock_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function updateCartQty(productId: number, qty: number) {
  if (typeof window === 'undefined') return;
  const cart = getCart().map(c => c.productId === productId ? { ...c, qty } : c).filter(c => c.qty > 0);
  localStorage.setItem('mock_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('mock_cart');
  window.dispatchEvent(new Event('cart-updated'));
}

// ---- ORDERS DATA (shared between Buyer checkout & Owner Dashboard) ----
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

const SEED_ORDERS: Order[] = [
  { id: 'ORD-001', client: 'Alice Johnson', email: 'alice@example.com', phone: '0301-1234567', address: '12 Main St', items: [{ productId: 1, name: 'Premium Watch', price: 299.99, qty: 1 }], total: 299.99, date: '2026-06-10', status: 'Pending' },
  { id: 'ORD-002', client: 'Bob Smith', email: 'bob@example.com', phone: '0311-9876543', address: '99 Park Ave', items: [{ productId: 2, name: 'MacBook Air', price: 1199.00, qty: 1 }], total: 1199.00, date: '2026-06-08', status: 'Ready', readyDate: '2026-06-09' },
];

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return SEED_ORDERS;
  const stored = localStorage.getItem('mock_orders');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_orders', JSON.stringify(SEED_ORDERS));
  return SEED_ORDERS;
}

export function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_orders', JSON.stringify(orders));
}

export function placeOrder(order: Omit<Order, 'id' | 'date' | 'status'>) {
  if (typeof window === 'undefined') return;
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  // Also log client
  addClient({ name: order.client, email: order.email, phone: order.phone, address: order.address, lastOrder: newOrder.id, date: newOrder.date });
  return newOrder;
}

// ---- CLIENTS DATA ----
export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastOrder: string;
  date: string;
};

const SEED_CLIENTS: Client[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '0301-1234567', address: '12 Main St', lastOrder: 'ORD-001', date: '2026-06-10' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '0311-9876543', address: '99 Park Ave', lastOrder: 'ORD-002', date: '2026-06-08' },
];

export function getClients(): Client[] {
  if (typeof window === 'undefined') return SEED_CLIENTS;
  const stored = localStorage.getItem('mock_clients');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_clients', JSON.stringify(SEED_CLIENTS));
  return SEED_CLIENTS;
}

export function addClient(client: Omit<Client, 'id'>) {
  if (typeof window === 'undefined') return;
  const clients = getClients();
  // Avoid duplicate emails — update if exists
  const existingIdx = clients.findIndex(c => c.email === client.email);
  if (existingIdx >= 0) {
    clients[existingIdx] = { ...clients[existingIdx], ...client };
  } else {
    clients.unshift({ ...client, id: Date.now() });
  }
  localStorage.setItem('mock_clients', JSON.stringify(clients));
}

