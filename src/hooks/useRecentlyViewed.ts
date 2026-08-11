"use client";

import { useState, useEffect, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'luxe_recently_viewed_ids';
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading recently viewed IDs:', e);
    }
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    if (!id) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recently viewed ID:', e);
      }
      return updated;
    });
  }, []);

  return { recentlyViewedIds, addRecentlyViewed };
}
