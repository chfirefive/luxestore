"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseHoldToPortalOptions {
  onNormalClick?: () => void;
  holdDuration?: number; // default 650ms
}

export function useHoldToPortal(options?: UseHoldToPortalOptions) {
  const router = useRouter();
  const holdDuration = options?.holdDuration || 650;
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const triggeredRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    // Only primary mouse button or touch
    if ('button' in e && e.button !== 0) return;
    triggeredRef.current = false;
    setIsHolding(true);
    setHoldProgress(0);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / holdDuration) * 100);
      setHoldProgress(pct);
      if (elapsed < holdDuration) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      setIsHolding(false);
      setHoldProgress(100);

      // Subtle haptic feedback if available
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(60);
        } catch {}
      }

      // Navigate to Owner & Buyer dual card portal
      router.push('/portal');
    }, holdDuration);
  };

  const handlePointerUp = () => {
    cleanup();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (triggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      triggeredRef.current = false;
      return;
    }
    if (options?.onNormalClick) {
      options.onNormalClick();
    }
  };

  return {
    isHolding,
    holdProgress,
    bind: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onClick: handleClick,
    },
  };
}
