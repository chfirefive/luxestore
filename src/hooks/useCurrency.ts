"use client";

import { useState, useEffect } from 'react';
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

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if user has a manual override saved in localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CurrencyConfig;
        setCurrencyState(parsed);
        setLoading(false);
        return;
      } catch {
        // malformed, ignore
      }
    }

    // 2. Detect country via free IP geolocation API (no key required)
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const countryCode = data?.country_code as string;
        if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
          setCurrencyState(COUNTRY_CURRENCY_MAP[countryCode]);
        }
      })
      .catch(() => {
        // silently fallback to USD
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setCurrency = (c: CurrencyConfig) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  };

  const formatPrice = (usdPrice: number) => _formatPrice(usdPrice, currency);

  return { currency, setCurrency, formatPrice, loading };
}
