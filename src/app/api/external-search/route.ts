import { NextResponse } from 'next/server';

// ─── External Product Search API ─────────────────────────────────────────────
// Uses SerpApi Google Shopping if SERPAPI_KEY is set, falls back to curated mock data.
// External stores & their support emails for automatic complaint/cancel forwarding.

const STORE_SUPPORT: Record<string, { name: string; supportEmail: string }> = {
  'amazon': { name: 'Amazon', supportEmail: 'cs-reply@amazon.com' },
  'aliexpress': { name: 'AliExpress', supportEmail: 'support@aliexpress.com' },
  'daraz': { name: 'Daraz', supportEmail: 'care@daraz.pk' },
  'alibaba': { name: 'Alibaba', supportEmail: 'support@alibaba.com' },
  'ebay': { name: 'eBay', supportEmail: 'cs@ebay.com' },
};

function detectStore(link: string): { name: string; supportEmail: string } {
  const lower = link.toLowerCase();
  for (const [key, val] of Object.entries(STORE_SUPPORT)) {
    if (lower.includes(key)) return val;
  }
  return { name: 'External Store', supportEmail: 'support@store.com' };
}

// Mock data for dev / no-API-key fallback
function getMockResults(query: string) {
  const q = query.toLowerCase();
  const mockItems = [
    {
      title: `${query} - Premium Quality`,
      price: 4999,
      imageUrl: 'https://via.placeholder.com/200x200?text=Product',
      link: 'https://www.amazon.com/s?k=' + encodeURIComponent(query),
      source: 'Amazon',
      supportEmail: 'cs-reply@amazon.com',
    },
    {
      title: `${query} - Best Seller`,
      price: 3299,
      imageUrl: 'https://via.placeholder.com/200x200?text=Product',
      link: 'https://www.aliexpress.com/wholesale?SearchText=' + encodeURIComponent(query),
      source: 'AliExpress',
      supportEmail: 'support@aliexpress.com',
    },
    {
      title: `${query} - Fast Delivery`,
      price: 6750,
      imageUrl: 'https://via.placeholder.com/200x200?text=Product',
      link: 'https://www.daraz.pk/catalog/?q=' + encodeURIComponent(query),
      source: 'Daraz',
      supportEmail: 'care@daraz.pk',
    },
    {
      title: `${query} - Wholesale Pack`,
      price: 2100,
      imageUrl: 'https://via.placeholder.com/200x200?text=Product',
      link: 'https://www.alibaba.com/trade/search?SearchText=' + encodeURIComponent(query),
      source: 'Alibaba',
      supportEmail: 'support@alibaba.com',
    },
    {
      title: `${query} - Limited Stock`,
      price: 8499,
      imageUrl: 'https://via.placeholder.com/200x200?text=Product',
      link: 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(query),
      source: 'eBay',
      supportEmail: 'cs@ebay.com',
    },
  ];
  return mockItems;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const commission = parseFloat(process.env.EXTERNAL_ORDER_COMMISSION || '0.15');
    const serpKey = process.env.SERPAPI_KEY;

    let results: {
      title: string;
      price: number;
      imageUrl: string;
      link: string;
      source: string;
      supportEmail: string;
      ourPrice: number;
      commissionRate: number;
    }[] = [];

    if (serpKey) {
      // Real SerpApi call
      const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${serpKey}&num=8&gl=pk&hl=en`;
      const resp = await fetch(url, { next: { revalidate: 60 } });
      const data = await resp.json();

      if (data.shopping_results && Array.isArray(data.shopping_results)) {
        results = data.shopping_results.slice(0, 8).map((item: any) => {
          // SerpApi returns price as string like "$12.99" — parse to number
          const rawPrice = item.extracted_price || parseFloat((item.price || '0').replace(/[^0-9.]/g, '')) || 0;
          // Convert USD to PKR approximately (1 USD ≈ 278 PKR)
          const priceInPkr = rawPrice < 200 ? Math.round(rawPrice * 278) : Math.round(rawPrice);
          const store = detectStore(item.link || '');
          return {
            title: item.title || q,
            price: priceInPkr,
            imageUrl: item.thumbnail || '',
            link: item.link || item.product_link || '#',
            source: item.source || store.name,
            supportEmail: store.supportEmail,
            ourPrice: Math.ceil(priceInPkr * (1 + commission)),
            commissionRate: commission,
          };
        });
      }
    }

    // Always use mock if serpApi returned nothing or no key
    if (results.length === 0) {
      const mocks = getMockResults(q);
      results = mocks.map(m => ({
        ...m,
        ourPrice: Math.ceil(m.price * (1 + commission)),
        commissionRate: commission,
      }));
    }

    return NextResponse.json({ results, isMock: !serpKey });
  } catch (err: any) {
    console.error('External search error:', err);
    return NextResponse.json({ results: [], error: err.message }, { status: 500 });
  }
}
