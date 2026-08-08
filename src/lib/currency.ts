// Currency configuration - hardcoded rates vs USD, no API key required
export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // multiplier from USD
  name: string;
}

// Map of country code -> currency config
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Americas
  US: { code: 'USD', symbol: '$',    rate: 1.0,    name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'C$',   rate: 1.36,   name: 'Canadian Dollar' },
  MX: { code: 'MXN', symbol: 'MX$',  rate: 17.2,   name: 'Mexican Peso' },
  BR: { code: 'BRL', symbol: 'R$',   rate: 5.05,   name: 'Brazilian Real' },
  AR: { code: 'ARS', symbol: 'ARS$', rate: 870,    name: 'Argentine Peso' },

  // Europe
  GB: { code: 'GBP', symbol: '£',    rate: 0.79,   name: 'British Pound' },
  DE: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  FR: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  IT: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  ES: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  NL: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  BE: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  PT: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  AT: { code: 'EUR', symbol: '€',    rate: 0.92,   name: 'Euro' },
  CH: { code: 'CHF', symbol: 'Fr',   rate: 0.90,   name: 'Swiss Franc' },
  SE: { code: 'SEK', symbol: 'kr',   rate: 10.5,   name: 'Swedish Krona' },
  NO: { code: 'NOK', symbol: 'kr',   rate: 10.6,   name: 'Norwegian Krone' },
  DK: { code: 'DKK', symbol: 'kr',   rate: 6.88,   name: 'Danish Krone' },
  PL: { code: 'PLN', symbol: 'zł',   rate: 3.98,   name: 'Polish Zloty' },
  TR: { code: 'TRY', symbol: '₺',    rate: 32.5,   name: 'Turkish Lira' },
  RU: { code: 'RUB', symbol: '₽',    rate: 91.5,   name: 'Russian Ruble' },

  // South Asia
  PK: { code: 'PKR', symbol: 'Rs',    rate: 278,    name: 'Pakistani Rupee' },
  IN: { code: 'INR', symbol: '₹',    rate: 83.5,   name: 'Indian Rupee' },
  BD: { code: 'BDT', symbol: '৳',    rate: 110,    name: 'Bangladeshi Taka' },
  LK: { code: 'LKR', symbol: 'Rs',   rate: 300,    name: 'Sri Lankan Rupee' },
  NP: { code: 'NPR', symbol: 'रू',    rate: 133,    name: 'Nepalese Rupee' },

  // Middle East & Gulf
  AE: { code: 'AED', symbol: 'د.إ',  rate: 3.67,   name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: '﷼',    rate: 3.75,   name: 'Saudi Riyal' },
  QA: { code: 'QAR', symbol: 'QR',   rate: 3.64,   name: 'Qatari Riyal' },
  KW: { code: 'KWD', symbol: 'KD',   rate: 0.31,   name: 'Kuwaiti Dinar' },
  BH: { code: 'BHD', symbol: 'BD',   rate: 0.38,   name: 'Bahraini Dinar' },
  OM: { code: 'OMR', symbol: 'RO',   rate: 0.385,  name: 'Omani Rial' },
  EG: { code: 'EGP', symbol: 'E£',   rate: 30.9,   name: 'Egyptian Pound' },
  JO: { code: 'JOD', symbol: 'JD',   rate: 0.71,   name: 'Jordanian Dinar' },

  // East Asia & Pacific
  CN: { code: 'CNY', symbol: '¥',    rate: 7.24,   name: 'Chinese Yuan' },
  JP: { code: 'JPY', symbol: '¥',    rate: 149,    name: 'Japanese Yen' },
  KR: { code: 'KRW', symbol: '₩',    rate: 1340,   name: 'South Korean Won' },
  AU: { code: 'AUD', symbol: 'A$',   rate: 1.55,   name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$',  rate: 1.63,   name: 'New Zealand Dollar' },
  SG: { code: 'SGD', symbol: 'S$',   rate: 1.34,   name: 'Singapore Dollar' },
  HK: { code: 'HKD', symbol: 'HK$',  rate: 7.82,   name: 'Hong Kong Dollar' },
  TH: { code: 'THB', symbol: '฿',    rate: 35.5,   name: 'Thai Baht' },
  ID: { code: 'IDR', symbol: 'Rp',   rate: 15800,  name: 'Indonesian Rupiah' },
  MY: { code: 'MYR', symbol: 'RM',   rate: 4.72,   name: 'Malaysian Ringgit' },
  PH: { code: 'PHP', symbol: '₱',    rate: 56.5,   name: 'Philippine Peso' },

  // Africa
  ZA: { code: 'ZAR', symbol: 'R',    rate: 18.6,   name: 'South African Rand' },
  NG: { code: 'NGN', symbol: '₦',    rate: 1550,   name: 'Nigerian Naira' },
  KE: { code: 'KES', symbol: 'KSh',  rate: 130,    name: 'Kenyan Shilling' },
  GH: { code: 'GHS', symbol: 'GH₵',  rate: 12.3,   name: 'Ghanaian Cedi' },
  MA: { code: 'MAD', symbol: 'MAD',  rate: 10.1,   name: 'Moroccan Dirham' },
};

// Default fallback — Pakistani Rupee
export const DEFAULT_CURRENCY: CurrencyConfig = COUNTRY_CURRENCY_MAP['PK'];

// All available currencies (deduplicated) for manual selector
export const ALL_CURRENCIES: CurrencyConfig[] = Array.from(
  new Map(
    Object.values(COUNTRY_CURRENCY_MAP).map(c => [c.code, c])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

/**
 * Convert a USD price to the target currency and return formatted string
 */
/**
 * Convert a price from the system's base currency (owner's set currency) to the target currency and return formatted string
 */
export const BASE_CURRENCY: CurrencyConfig = DEFAULT_CURRENCY;
export function formatPrice(basePrice: number, targetCurrency: CurrencyConfig = BASE_CURRENCY): string {
  // If target is the same as base, just format directly
  if (targetCurrency.code === BASE_CURRENCY.code) {
    const decimals = basePrice >= 100 ? 0 : 2;
    return `${targetCurrency.symbol}${basePrice.toFixed(decimals)}`;
  }
  // Convert via USD rates: basePrice is in base currency units
  // Convert base price to USD first, then to target currency
  const priceInUSD = basePrice / BASE_CURRENCY.rate; // baseRate is relative to USD
  const converted = priceInUSD * targetCurrency.rate;
  const decimals = converted >= 100 ? 0 : 2;
  return `${targetCurrency.symbol}${converted.toFixed(decimals)}`;
}
