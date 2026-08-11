"use client";

import { useState, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'luxe_recently_viewed_ids';
const MAX_ITEMS = 12;

function getInitialIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading recently viewed IDs:', e);
  }
  return [];
}

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(getInitialIds);

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
