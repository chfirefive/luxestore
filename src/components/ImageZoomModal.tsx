"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface ImageZoomModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageZoomModal({ src, alt, onClose }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    const maxPan = Math.max(0, (currentScale - 1) * 220);
    return {
      x: Math.max(-maxPan, Math.min(maxPan, x)),
      y: Math.max(-maxPan, Math.min(maxPan, y)),
    };
  }, []);

  const handleZoomIn = () => {
    setScale(s => {
      const next = Math.min(s + 0.5, 5);
      setPosition(p => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setScale(s => {
      const next = Math.max(s - 0.5, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      else setPosition(p => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  const handleReset = () => {
    setScale(1.5);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
    setIsDragging(true);
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const newPos = clampPosition(
      dragStart.current.px + (e.clientX - dragStart.current.x),
      dragStart.current.py + (e.clientY - dragStart.current.y),
      scale
    );
    setPosition(newPos);
  }, [isDragging, scale, clampPosition]);

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  // Touch drag
  const touchStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, px: position.x, py: position.y };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    e.preventDefault();
    const t = e.touches[0];
    const newPos = clampPosition(
      touchStart.current.px + (t.clientX - touchStart.current.x),
      touchStart.current.py + (t.clientY - touchStart.current.y),
      scale
    );
    setPosition(newPos);
  };

  const onTouchEnd = () => { touchStart.current = null; };

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale(s => {
      const next = Math.min(5, Math.max(0.5, s + delta));
      if (next <= 1) setPosition({ x: 0, y: 0 });
      else setPosition(p => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        onClick={onClose}
      >
        {/* Top Controls Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
            zIndex: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Maximize2 size={15} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>
              Scroll to zoom · Drag to pan
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ZoomCtrlBtn onClick={handleZoomOut} title="Zoom out" disabled={scale <= 0.5}>
              <ZoomOut size={17} />
            </ZoomCtrlBtn>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '20px',
              padding: '4px 12px',
              minWidth: '54px',
              textAlign: 'center',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}>
              {Math.round(scale * 100)}%
            </div>

            <ZoomCtrlBtn onClick={handleZoomIn} title="Zoom in" disabled={scale >= 5}>
              <ZoomIn size={17} />
            </ZoomCtrlBtn>

            <ZoomCtrlBtn onClick={handleReset} title="Reset view">
              <RotateCcw size={17} />
            </ZoomCtrlBtn>

            <ZoomCtrlBtn
              onClick={onClose}
              title="Close (Esc)"
              style={{ marginLeft: '6px', background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.35)' }}
            >
              <X size={17} />
            </ZoomCtrlBtn>
          </div>
        </motion.div>

        {/* Image Stage */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            width: '90vw',
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            position: 'relative',
          }}
          onClick={e => e.stopPropagation()}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove as unknown as React.TouchEventHandler}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel}
        >
          <motion.img
            src={src}
            alt={alt}
            animate={{ scale, x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '10px',
              pointerEvents: 'none',
              boxShadow: '0 20px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
            draggable={false}
          />
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'absolute',
            bottom: '18px',
            color: 'rgba(255,255,255,0.28)',
            fontSize: '0.78rem',
            fontWeight: 500,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          Double-click the image or press Esc to close
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Internal control button ──────────────────────────────────────────────────
interface ZoomCtrlBtnProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function ZoomCtrlBtn({ onClick, title, disabled, children, style }: ZoomCtrlBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '9px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
