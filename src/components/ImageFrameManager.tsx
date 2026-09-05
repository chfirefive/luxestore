"use client";

import React, { useState, useRef } from 'react';

export interface FramingConfig {
  position: string; // e.g. "50% 50%" or "top center"
  fit: 'cover' | 'contain';
  zoom: number; // 0.7 to 1.8
}

interface ImageFrameManagerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  initialPosition?: string;
  initialFit?: 'cover' | 'contain';
  initialZoom?: number;
  aspectHint?: 'banner' | 'card' | 'both';
  onSave: (config: FramingConfig) => void;
}

// Parse "50% 50%" or keywords like "center center", "top center" into X and Y percentages
function parsePosition(posStr?: string): { x: number; y: number } {
  if (!posStr) return { x: 50, y: 50 };

  const keywordMap: Record<string, { x: number; y: number }> = {
    'top left': { x: 0, y: 0 },
    'top center': { x: 50, y: 0 },
    'top': { x: 50, y: 0 },
    'top right': { x: 100, y: 0 },
    'center left': { x: 0, y: 50 },
    'left': { x: 0, y: 50 },
    'center': { x: 50, y: 50 },
    'center center': { x: 50, y: 50 },
    'center right': { x: 100, y: 50 },
    'right': { x: 100, y: 50 },
    'bottom left': { x: 0, y: 100 },
    'bottom center': { x: 50, y: 100 },
    'bottom': { x: 50, y: 100 },
    'bottom right': { x: 100, y: 100 },
  };

  const normalized = posStr.trim().toLowerCase();
  if (keywordMap[normalized]) {
    return keywordMap[normalized];
  }

  const matches = normalized.match(/(-?\d+(?:\.\d+)?)%/g);
  if (matches && matches.length >= 2) {
    const x = parseFloat(matches[0]);
    const y = parseFloat(matches[1]);
    return {
      x: isNaN(x) ? 50 : Math.max(0, Math.min(100, x)),
      y: isNaN(y) ? 50 : Math.max(0, Math.min(100, y))
    };
  }

  return { x: 50, y: 50 };
}

export default function ImageFrameManager({
  isOpen,
  onClose,
  imageUrl,
  title = 'Framing & Focal Point Manager',
  initialPosition = '50% 50%',
  initialFit = 'cover',
  initialZoom = 1,
  aspectHint = 'both',
  onSave
}: ImageFrameManagerProps) {
  const parsed = parsePosition(initialPosition);
  const [posX, setPosX] = useState(parsed.x);
  const [posY, setPosY] = useState(parsed.y);
  const [fit, setFit] = useState<'cover' | 'contain'>(initialFit || 'cover');
  const [zoom, setZoom] = useState<number>(initialZoom || 1);
  const [previewMode, setPreviewMode] = useState<'banner' | 'mobile' | 'card'>(
    aspectHint === 'banner' ? 'banner' : (aspectHint === 'card' ? 'card' : 'banner')
  );
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync state if initial props change while mounted without triggering cascading effect renders
  const [prevProps, setPrevProps] = useState({ imageUrl, initialPosition, initialFit, initialZoom });
  if (
    prevProps.imageUrl !== imageUrl ||
    prevProps.initialPosition !== initialPosition ||
    prevProps.initialFit !== initialFit ||
    prevProps.initialZoom !== initialZoom
  ) {
    setPrevProps({ imageUrl, initialPosition, initialFit, initialZoom });
    const p = parsePosition(initialPosition);
    setPosX(p.x);
    setPosY(p.y);
    setFit(initialFit || 'cover');
    setZoom(initialZoom || 1);
  }

  if (!isOpen || !imageUrl) return null;

  const handlePointerCalc = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));
    setPosX(x);
    setPosY(y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerCalc(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handlePointerCalc(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerCalc(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const applyPreset = (x: number, y: number) => {
    setPosX(x);
    setPosY(y);
  };

  const handleReset = () => {
    setPosX(50);
    setPosY(50);
    setFit('cover');
    setZoom(1);
  };

  const handleSave = () => {
    onSave({
      position: `${posX}% ${posY}%`,
      fit,
      zoom: Number(zoom.toFixed(2))
    });
    onClose();
  };

  const presets = [
    { label: '↖ Top L', x: 10, y: 10 },
    { label: '⬆ Top', x: 50, y: 10 },
    { label: '↗ Top R', x: 90, y: 10 },
    { label: '⬅ Left', x: 10, y: 50 },
    { label: '⏺ Center', x: 50, y: 50 },
    { label: '➡ Right', x: 90, y: 50 },
    { label: '↙ Btm L', x: 10, y: 90 },
    { label: '⬇ Bottom', x: 50, y: 90 },
    { label: '↘ Btm R', x: 90, y: 90 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0d131f',
          border: '1px solid rgba(214, 178, 105, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(214, 178, 105, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff'
        }}
        onClick={e => e.stopPropagation()}
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(90deg, rgba(214, 178, 105, 0.08) 0%, transparent 100%)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#D6B269' }}>🎯</span> {title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Pinpoint the key item/subject to keep it in view and adjust framing so it never gets cut off.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.75rem' }}>
          
          {/* Left Column: Interactive Pin Locator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> Interactive Focal Point (Click or Drag Pin)
                </label>
                <span style={{ fontSize: '0.78rem', color: '#D6B269', background: 'rgba(214, 178, 105, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  X: {posX}% • Y: {posY}%
                </span>
              </div>
              
              {/* Image Canvas with Crosshair Pin */}
              <div
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onTouchStart={e => {
                  if (e.touches.length > 0) handlePointerCalc(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={handleTouchMove}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 10',
                  maxHeight: '280px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#05080f',
                  border: '2px solid rgba(214, 178, 105, 0.3)',
                  cursor: isDragging ? 'grabbing' : 'crosshair',
                  userSelect: 'none',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
                }}
              >
                {/* Source Image */}
                <img
                  src={imageUrl}
                  alt="Focal target"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />

                {/* Rule of Thirds subtle lines */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridTemplateRows: '1fr 1fr 1fr',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                </div>

                {/* Crosshair target pin */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${posY}%`,
                    left: `${posX}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: isDragging ? 'none' : 'top 0.15s ease, left 0.15s ease'
                  }}
                >
                  {/* Outer pulsating ring */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      border: '2px solid #D6B269',
                      background: 'rgba(214, 178, 105, 0.25)',
                      boxShadow: '0 0 16px rgba(214, 178, 105, 0.9), inset 0 0 8px rgba(214, 178, 105, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Center crosshair dot */}
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 0 6px #ffffff'
                      }}
                    />
                  </div>
                  {/* Axis Crosshairs */}
                  <div style={{ position: 'absolute', width: '22px', height: '1px', background: 'rgba(214, 178, 105, 0.8)', left: '-11px' }} />
                  <div style={{ position: 'absolute', width: '22px', height: '1px', background: 'rgba(214, 178, 105, 0.8)', right: '-11px' }} />
                  <div style={{ position: 'absolute', width: '1px', height: '22px', background: 'rgba(214, 178, 105, 0.8)', top: '-11px' }} />
                  <div style={{ position: 'absolute', width: '1px', height: '22px', background: 'rgba(214, 178, 105, 0.8)', bottom: '-11px' }} />
                </div>
              </div>
            </div>

            {/* Quick 9-Point Presets */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Quick Alignment Presets
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px'
                }}
              >
                {presets.map(p => {
                  const isActive = Math.abs(posX - p.x) <= 15 && Math.abs(posY - p.y) <= 15;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.x, p.y)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: isActive ? '1px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isActive ? 'rgba(214, 178, 105, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        color: isActive ? '#D6B269' : '#cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Framing Mode: Cover vs Contain */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Frame Fit Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFit('cover')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: fit === 'cover' ? '1.5px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: fit === 'cover' ? 'rgba(214, 178, 105, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    color: fit === 'cover' ? '#f59e0b' : '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <span>🖼️ Cover (Fill Frame)</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>Crops smoothly to anchor on focal pin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFit('contain')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: fit === 'contain' ? '1.5px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: fit === 'contain' ? 'rgba(214, 178, 105, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    color: fit === 'contain' ? '#f59e0b' : '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <span>🔍 Contain (100% Item)</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>Never crops any edges of the item</span>
                </button>
              </div>
            </div>

            {/* Zoom / Scale Control */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
                  Scale / Zoom Level
                </label>
                <span style={{ fontSize: '0.78rem', color: '#D6B269', fontWeight: 700 }}>
                  {Math.round(zoom * 100)}% ({zoom.toFixed(2)}x)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>0.7x</span>
                <input
                  type="range"
                  min={0.7}
                  max={1.6}
                  step={0.05}
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#D6B269',
                    cursor: 'pointer',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>1.6x</span>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  style={{
                    padding: '2px 8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Multi-Frame Simulator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👁️</span> Live Frame Simulator
                </label>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Real-time
                </span>
              </div>

              {/* View Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode('banner')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: previewMode === 'banner' ? '1px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: previewMode === 'banner' ? 'rgba(214, 178, 105, 0.2)' : 'transparent',
                    color: previewMode === 'banner' ? '#D6B269' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🖥️ Desktop Banner
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: previewMode === 'mobile' ? '1px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: previewMode === 'mobile' ? 'rgba(214, 178, 105, 0.2)' : 'transparent',
                    color: previewMode === 'mobile' ? '#D6B269' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📱 Mobile Banner
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode('card')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: previewMode === 'card' ? '1px solid #D6B269' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: previewMode === 'card' ? 'rgba(214, 178, 105, 0.2)' : 'transparent',
                    color: previewMode === 'card' ? '#D6B269' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🛍️ Product Card
                </button>
              </div>
            </div>

            {/* Frame Window */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                background: '#070b12',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                overflow: 'hidden'
              }}
            >
              {/* Simulated Frame */}
              <div
                style={{
                  position: 'relative',
                  width: previewMode === 'banner' ? '100%' : (previewMode === 'mobile' ? '190px' : '220px'),
                  aspectRatio: previewMode === 'banner' ? '16 / 9' : (previewMode === 'mobile' ? '9 / 14' : '1 / 1'),
                  borderRadius: previewMode === 'card' ? '16px' : '12px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(214, 178, 105, 0.25)',
                  background: '#0b0f17'
                }}
              >
                {/* When fit === 'contain', show blurred luxury backdrop */}
                {fit === 'contain' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundSize: 'cover',
                      filter: 'blur(16px) brightness(0.4)',
                      transform: 'scale(1.3)'
                    }}
                  />
                )}

                {/* Main Framed Image */}
                <img
                  src={imageUrl}
                  alt="Simulated frame preview"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: fit,
                    objectPosition: `${posX}% ${posY}%`,
                    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                    transition: 'object-position 0.1s ease, transform 0.1s ease'
                  }}
                />

                {/* Luxury banner text mockup overlay if in banner mode */}
                {previewMode === 'banner' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(11, 15, 23, 0.75) 0%, rgba(11, 15, 23, 0.2) 60%, transparent 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px'
                    }}
                  >
                    <div style={{ maxWidth: '60%' }}>
                      <div style={{ fontSize: '0.65rem', color: '#D6B269', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>★ Signature Selection</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>Your Headline Here</div>
                    </div>
                  </div>
                )}

                {/* Product Card badge overlay if in card mode */}
                {previewMode === 'card' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    SAVE 20%
                  </div>
                )}

                {/* Corner indicator badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#D6B269',
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(214, 178, 105, 0.3)'
                  }}
                >
                  {previewMode === 'banner' ? '16:9 Banner Frame' : (previewMode === 'mobile' ? 'Mobile Banner Frame' : '1:1 Product Frame')}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, textAlign: 'center' }}>
              💡 The preview updates live as you drag the pin or change settings. What you see is exactly what shoppers will see!
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ↺ Reset to Center
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#cbd5e1',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                background: '#D6B269',
                border: 'none',
                color: '#0b0f17',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(214, 178, 105, 0.4)'
              }}
            >
              ✓ Apply Framing & Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
