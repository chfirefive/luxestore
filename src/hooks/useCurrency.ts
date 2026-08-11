"use client";

import { useState, useCallback } from 'react';
import {
  CurrencyConfig,
  COUNTRY_CURRENCY_MAP,
  DEFAULT_CURRENCY,
  formatPrice as _formatPrice,
} from '@/lib/currency';

const STORAGE_KEY = 'luxe_currency';

interface UseCurrencyReturn {
  currency: CurrencyConfig;
  setCurrency: (c: CurrencyConfig) => void;
  formatPrice: (usdPrice: number) => string;
  loading: boolean;
}

function getInitialCurrency(): CurrencyConfig {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as CurrencyConfig;
    } catch {
      // malformed, ignore
    }
  }
  return DEFAULT_CURRENCY;
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(getInitialCurrency);
  const [loading, setLoading] = useState(false);

  // Detect country currency via IP geolocation (only if no saved preference)
  // We do this once via a module-level flag to avoid multiple fetches
  useState(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return; // already have a preference
    setLoading(true);
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const countryCode = data?.country_code as string;
        if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
          setCurrencyState(COUNTRY_CURRENCY_MAP[countryCode]);
        }
      })
      .catch(() => {
        // silently fallback to default
      })
      .finally(() => {
        setLoading(false);
      });
  });

  const setCurrency = useCallback((c: CurrencyConfig) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  }, []);

  const formatPrice = (usdPrice: number) => _formatPrice(usdPrice, currency);

  return { currency, setCurrency, formatPrice, loading };
}
