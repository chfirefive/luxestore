"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Heart, ChevronRight, Info } from 'lucide-react';
import { addToCart, Product } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './ProductDetails.module.css';
import { useCurrency } from '@/hooks/useCurrency';

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['9', '9.5', '10', '10.5'];
  const colors = product.colors && product.colors.length > 0 ? product.colors : [
    { name: 'Default', hex: product.backgroundGradient?.includes('linear') ? product.backgroundGradient.split(',')[1].trim() : (product.backgroundGradient || '#10b981') },
    { name: 'Dark Slate', hex: '#1e293b' },
  ];
  
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const { formatPrice, currency } = useCurrency();
  
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // 3D Swipe logic for Add to Cart
  const x = useMotionValue(0);
  const swipeControls = useAnimation();
  const maxSwipe = 160;
  const swipeOpacity = useTransform(x, [0, maxSwipe], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxSwipe], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x >= maxSwipe - 20 && !isOutOfStock) {
      addToCart(product, selectedSize, selectedColor.hex);
      swipeControls.start({ x: maxSwipe });
      setTimeout(() => {
        router.push('/cart');
      }, 600);
    } else {
      swipeControls.start({ x: 0 });
    }
  };

  const bgStyle = product.backgroundGradient || 'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
  const brandName = product.name.split(' ')[0].toUpperCase();

  return (
    <div className={styles.pageContainer}>
      
      {/* Full-bleed Gradient Background */}
      <div 
        className={styles.bgShape} 
        style={{ background: bgStyle }}
      />
      
      {/* Header Bar: Back, Brand Logo, Cart */}
      <div className={styles.topNav}>
        <button onClick={() => router.back()} className={`neumorphic-btn ${styles.navBtn}`} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>

        <div className={styles.brandHeader}>
          <Icons.Store />
        </div>

        <button onClick={() => router.push('/cart')} className={`neumorphic-btn ${styles.navBtn}`} aria-label="View cart" style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
        </button>
      </div>

      <div className={styles.contentWrapper}>

        {/* Center Top Title Block */}
        <div className={styles.headerInfo}>
          {product.isHot && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              color: 'white',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              marginBottom: '8px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              🔥 HOT ITEM
            </div>
          )}
          <h1 className={styles.productTitle}>{product.name}</h1>
          <p className={styles.productSubtitle}>{product.categorySlug}</p>
        </div>

        {/* Main Interactive Stage */}
        <div className={styles.stageContainer}>
          
          {/* Large Center Background Brand Watermark */}
          <div className={styles.bigBgText}>{brandName}</div>
          
          {/* Center Product Image or 3D Animated Fallback */}
          {product.imageUrl ? (
            <motion.img 
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 60, delay: 0.1 }}
              src={product.imageUrl} 
              alt={product.name} 
              className={styles.productImage}
            />
          ) : (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, -12, 0], opacity: 1 }}
              transition={{ 
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                opacity: { duration: 0.5 }
              }}
              className={styles.fallback3DContainer}
            >
              <div className={styles.ambientGlow} style={{ background: selectedColor.hex || 'var(--primary)' }} />
              <svg viewBox="0 0 200 200" className={styles.fallback3DSvg}>
                <defs>
                  <linearGradient id="shoe3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={selectedColor.hex || '#6366f1'} stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="shadow3D">
                    <feDropShadow dx="0" dy="15" stdDeviation="10" floodColor="#000" floodOpacity="0.35" />
                  </filter>
                </defs>
                <g filter="url(#shadow3D)" transform="rotate(-15 100 100)">
                  <path 
                    d="M 30 110 C 30 90, 60 70, 90 70 C 110 70, 130 50, 150 50 C 165 50, 175 60, 170 75 C 165 90, 140 105, 110 115 C 80 125, 40 120, 30 110 Z" 
                    fill="url(#shoe3DGrad)" 
                  />
                  <path 
                    d="M 25 115 C 25 110, 80 115, 120 112 C 160 110, 175 105, 175 115 C 175 125, 140 130, 80 130 C 40 130, 25 125, 25 115 Z" 
                    fill="rgba(255,255,255,0.3)" 
                  />
                  <circle cx="145" cy="65" r="6" fill="rgba(255,255,255,0.7)" />
                  <line x1="85" y1="78" x2="115" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <line x1="90" y1="88" x2="120" y2="82" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <line x1="95" y1="98" x2="125" y2="92" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                </g>
              </svg>
            </motion.div>
          )}

          {/* Left Vertical Column: Item Info Button + Size Stack */}
          <div className={styles.leftOverlay}>
            
            {/* Description Info Button */}
            <div className={styles.infoSection}>
              <span className={styles.overlayLabel}>Info</span>
              <button 
                onClick={() => setShowDescModal(true)} 
                className={`neumorphic-btn ${styles.infoBtn}`}
                title="View Item Description"
                aria-label="View Item Description"
              >
                <Info size={18} />
              </button>
            </div>

            {/* Size Stack */}
            <span className={styles.overlayLabel} style={{ marginTop: '0.75rem' }}>Size</span>
            <div className={styles.verticalStack}>
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`neumorphic-btn ${styles.sizePill} ${selectedSize === size ? styles.activePill : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Right Vertical Column: Fav + Color Stack */}
          <div className={styles.rightOverlay}>
            
            {/* Favorite Heart */}
            <div className={styles.favSection}>
              <span className={styles.overlayLabel}>Fav</span>
              <button 
                onClick={() => setIsFavorite(!isFavorite)} 
                className={`neumorphic-btn ${styles.favBtn} ${isFavorite ? styles.activeFav : ''}`}
                aria-label="Add to favorites"
              >
                <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : 'currentColor'} />
              </button>
            </div>

            {/* Color Swatches */}
            <div className={styles.colorSection}>
              <span className={styles.overlayLabel}>Color</span>
              <div className={styles.verticalStack}>
                {colors.map(color => (
                  <button 
                    key={color.name + color.hex}
                    onClick={() => setSelectedColor(color)}
                    className={`neumorphic-btn ${styles.colorPill} ${selectedColor.name === color.name ? styles.activeColorPill : ''}`}
                    title={color.name}
                  >
                    <div className={styles.colorDot} style={{ background: color.hex }} />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Price & 3D Animated Swipe Action */}
        <div className={styles.bottomBar}>
          
          <div className={styles.priceBlock}>
            <div className={styles.priceValue}>{formatPrice(product.price)}</div>
            <div className={styles.priceLabel}>{currency.code}</div>
          </div>
          
          {isOutOfStock ? (
            <div className={styles.swipeContainer} style={{ justifyContent: 'center', opacity: 0.6 }}>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>Sold Out</span>
            </div>
          ) : (
            <div className={styles.swipeContainer3D}>
              <motion.div 
                style={{ 
                  position: 'absolute', inset: 0, borderRadius: '32px', 
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  opacity: bgOpacity,
                  boxShadow: '0 0 20px rgba(16,185,129,0.5)'
                }} 
              />
              
              <motion.div style={{ opacity: swipeOpacity }} className={styles.swipeText}>
                Swipe Right
              </motion.div>

              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: maxSwipe }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={swipeControls}
                style={{ x }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`neumorphic-btn ${styles.swipeThumb3D}`}
              >
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                >
                  <ChevronRight size={22} color="var(--primary)" />
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>

      </div>

      {/* Description Popup Modal */}
      {showDescModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowDescModal(false)}>
          <motion.div 
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className={`neumorphic-outer ${styles.descModal}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Item Description</h3>
              <button 
                onClick={() => setShowDescModal(false)}
                className="neumorphic-btn"
                style={{ width: '32px', height: '32px', cursor: 'pointer', border: 'none', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{product.name}</h4>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {product.description || 'No detailed written description provided for this product yet.'}
            </p>

            <button 
              onClick={() => setShowDescModal(false)}
              className="btn-primary shine-effect"
              style={{ width: '100%', marginTop: '1.5rem', padding: '10px' }}
            >
              Close Details
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
