/**
 * searchRelations.ts
 *
 * Semantic keyword expansion for the LuxeStore search.
 * When a user searches for a term, this map returns additional
 * related keywords to also match against — similar to how Daraz
 * surfaces "charger" results when you search "phone".
 *
 * Usage:
 *   import { expandQuery } from '@/lib/searchRelations';
 *   const terms = expandQuery('phone');
 *   // → ['phone', 'smartphone', 'mobile', 'charger', 'cable', ...]
 */

type RelationMap = Record<string, string[]>;

/** Core relation map — extend freely */
const RELATIONS: RelationMap = {
  // ── Mobile / Phone ──
  phone:      ['smartphone', 'mobile', 'charger', 'cable', 'case', 'screen protector', 'earphone', 'earbuds', 'handsfree', 'sim', 'android', 'iphone', 'cellphone', 'powerbank', 'holder', 'stand'],
  smartphone: ['phone', 'mobile', 'charger', 'cable', 'case', 'earphone', 'earbuds', 'android', 'iphone'],
  mobile:     ['phone', 'smartphone', 'charger', 'cable', 'case', 'earphone'],
  iphone:     ['apple', 'phone', 'smartphone', 'charger', 'cable', 'case', 'airpod', 'magsafe'],
  android:    ['phone', 'smartphone', 'samsung', 'charger', 'cable', 'case'],
  charger:    ['cable', 'adapter', 'powerbank', 'phone', 'laptop', 'usb', 'wireless charger', 'fast charge'],
  earphone:   ['earbuds', 'headphone', 'handsfree', 'airpod', 'tws', 'audio', 'music', 'bluetooth'],
  earbuds:    ['earphone', 'headphone', 'airpod', 'tws', 'bluetooth', 'wireless'],
  headphone:  ['earphone', 'earbuds', 'headset', 'audio', 'music', 'bluetooth', 'noise cancel'],

  // ── Laptop / Computer ──
  laptop:     ['computer', 'notebook', 'pc', 'charger', 'mouse', 'keyboard', 'bag', 'sleeve', 'stand', 'cooling pad', 'ram', 'ssd', 'monitor'],
  computer:   ['laptop', 'desktop', 'pc', 'monitor', 'keyboard', 'mouse', 'processor', 'ram', 'ssd'],
  keyboard:   ['mouse', 'laptop', 'computer', 'gaming', 'mechanical', 'wireless'],
  mouse:      ['keyboard', 'laptop', 'computer', 'gaming', 'wireless', 'mousepad'],

  // ── TV / Screen ──
  tv:         ['television', 'monitor', 'smart tv', 'remote', 'hdmi', 'cable', 'wall mount'],
  television: ['tv', 'smart tv', 'monitor', 'remote', 'hdmi'],
  monitor:    ['tv', 'computer', 'laptop', 'hdmi', 'cable', 'stand', 'screen'],

  // ── Camera ──
  camera:     ['lens', 'dslr', 'mirrorless', 'tripod', 'memory card', 'sd card', 'bag', 'filter', 'flash', 'gopro', 'action cam'],
  lens:       ['camera', 'dslr', 'filter', 'tripod'],
  tripod:     ['camera', 'stand', 'selfie stick', 'phone holder'],

  // ── Audio ──
  speaker:    ['bluetooth speaker', 'soundbar', 'audio', 'music', 'wireless', 'bass', 'woofer'],
  audio:      ['speaker', 'headphone', 'earphone', 'earbuds', 'amplifier', 'music'],

  // ── Fashion / Clothing ──
  shoes:      ['sneakers', 'boots', 'sandals', 'footwear', 'laces', 'socks', 'slippers', 'loafers', 'heels', 'sport shoes'],
  sneakers:   ['shoes', 'sport shoes', 'running shoes', 'footwear', 'socks', 'laces'],
  shirt:      ['t-shirt', 'polo', 'blouse', 'top', 'clothing', 'fashion', 'men', 'women'],
  tshirt:     ['shirt', 'polo', 'top', 'clothing', 'fashion', 'casual'],
  dress:      ['clothing', 'fashion', 'gown', 'skirt', 'women', 'formal', 'casual'],
  pants:      ['jeans', 'trousers', 'shorts', 'clothing', 'fashion'],
  jeans:      ['pants', 'denim', 'trousers', 'clothing', 'fashion'],
  jacket:     ['coat', 'hoodie', 'sweatshirt', 'outerwear', 'clothing', 'fashion', 'winter'],
  hoodie:     ['jacket', 'sweatshirt', 'sweater', 'clothing', 'casual'],
  bag:        ['handbag', 'purse', 'backpack', 'laptop bag', 'tote', 'sling bag', 'wallet'],
  backpack:   ['bag', 'laptop bag', 'school bag', 'hiking', 'travel'],
  watch:      ['smartwatch', 'strap', 'band', 'fitness tracker', 'luxury', 'wrist'],
  smartwatch: ['watch', 'strap', 'band', 'fitness tracker', 'health', 'apple watch'],

  // ── Accessories ──
  glasses:    ['sunglasses', 'eyewear', 'frames', 'goggles', 'reading glasses'],
  sunglasses: ['glasses', 'eyewear', 'shades', 'uv protection'],
  belt:       ['leather', 'waist', 'buckle', 'fashion', 'men'],
  wallet:     ['purse', 'card holder', 'leather', 'money clip', 'bag'],

  // ── Beauty / Skincare ──
  skincare:   ['moisturizer', 'serum', 'sunscreen', 'face wash', 'toner', 'cream', 'beauty', 'lotion'],
  makeup:     ['lipstick', 'foundation', 'mascara', 'eyeshadow', 'beauty', 'cosmetics', 'blush'],
  perfume:    ['fragrance', 'scent', 'cologne', 'deodorant', 'body spray', 'luxury'],
  shampoo:    ['conditioner', 'hair care', 'hair oil', 'scalp', 'beauty'],

  // ── Home & Decor ──
  furniture:  ['sofa', 'chair', 'table', 'bed', 'wardrobe', 'shelf', 'cabinet', 'home decor'],
  sofa:       ['furniture', 'couch', 'chair', 'living room', 'home'],
  bed:        ['mattress', 'pillow', 'bedsheet', 'blanket', 'furniture', 'bedroom'],
  bedsheet:   ['bed', 'pillow', 'blanket', 'duvet', 'cover', 'bedroom'],

  // ── Kitchen / Appliances ──
  kitchen:    ['cookware', 'utensils', 'blender', 'microwave', 'air fryer', 'pot', 'pan', 'knife'],
  blender:    ['juicer', 'mixer', 'kitchen', 'smoothie', 'food processor'],
  airfryer:   ['oven', 'kitchen', 'cooking', 'microwave', 'grill'],

  // ── Sports / Fitness ──
  gym:        ['fitness', 'workout', 'dumbbell', 'resistance band', 'yoga mat', 'protein', 'sports'],
  fitness:    ['gym', 'workout', 'exercise', 'yoga', 'running', 'sports', 'health'],
  yoga:       ['mat', 'fitness', 'gym', 'workout', 'meditation', 'sports'],
  cricket:    ['bat', 'ball', 'sports', 'kit', 'helmet', 'gloves', 'pads'],
  football:   ['soccer', 'ball', 'cleats', 'jersey', 'sports', 'boots'],
  running:    ['shoes', 'sport shoes', 'fitness', 'tracker', 'shorts', 'water bottle'],

  // ── Kids / Toys ──
  toys:       ['kids', 'children', 'baby', 'games', 'lego', 'doll', 'puzzle', 'remote control'],
  baby:       ['kids', 'infant', 'newborn', 'diapers', 'toys', 'stroller', 'clothing'],

  // ── Books / Stationery ──
  books:      ['novel', 'textbook', 'study', 'notebook', 'pen', 'stationery', 'reading'],
  stationery: ['pen', 'pencil', 'notebook', 'books', 'school', 'office', 'marker'],

  // ── Gaming ──
  gaming:     ['console', 'controller', 'headset', 'keyboard', 'mouse', 'game', 'pc', 'ps5', 'xbox', 'nintendo'],
  controller: ['gaming', 'console', 'joystick', 'gamepad', 'ps5', 'xbox'],
};

/**
 * Expand a raw query string into an array of related search terms.
 * The original query words are always included first.
 *
 * @param query - Raw user input string
 * @returns Array of lowercase string terms to match against
 */
export function expandQuery(query: string): string[] {
  const rawTerms = query
    .toLowerCase()
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);

  const expanded = new Set<string>(rawTerms);

  for (const term of rawTerms) {
    // Direct key match
    if (RELATIONS[term]) {
      RELATIONS[term].forEach(r => expanded.add(r.toLowerCase()));
    }

    // Partial key match (e.g. "phones" matches "phone")
    for (const key of Object.keys(RELATIONS)) {
      if (term.startsWith(key) || key.startsWith(term)) {
        RELATIONS[key].forEach(r => expanded.add(r.toLowerCase()));
        expanded.add(key);
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Returns the "related terms" that were added beyond the original query.
 * Useful for showing "Also showing related items for: ..." UI.
 */
export function getRelatedTerms(query: string): string[] {
  const rawTerms = new Set(
    query.toLowerCase().split(/\s+/).map(t => t.trim()).filter(Boolean)
  );
  const allTerms = expandQuery(query);
  return allTerms.filter(t => !rawTerms.has(t));
}
