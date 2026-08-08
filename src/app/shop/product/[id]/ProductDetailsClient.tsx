"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Heart, ChevronRight } from 'lucide-react';
import { addToCart, Product } from '@/lib/firebaseDb';
import { Icons } from '@/components/Icons';
import styles from './ProductDetails.module.css';

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
  
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // Swipe logic for Add to Cart
  const x = useMotionValue(0);
  const swipeControls = useAnimation();
  const maxSwipe = 160; // Distance to trigger add to cart
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
          <h1 className={styles.productTitle}>{product.name}</h1>
          <p className={styles.productSubtitle}>{product.description || product.categorySlug}</p>
        </div>

        {/* Main Interactive Stage */}
        <div className={styles.stageContainer}>
          
          {/* Large Center Background Brand Watermark */}
          <div className={styles.bigBgText}>{brandName}</div>
          
          {/* Center Product Image */}
          {product.imageUrl && (
            <motion.img 
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 60, delay: 0.1 }}
              src={product.imageUrl} 
              alt={product.name} 
              className={styles.productImage}
            />
          )}

          {/* Left Vertical Column: Size Stack */}
          <div className={styles.leftOverlay}>
            <span className={styles.overlayLabel}>Size</span>
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

        {/* Bottom Bar: Price & Swipe Action */}
        <div className={styles.bottomBar}>
          
          <div className={styles.priceBlock}>
            <div className={styles.priceValue}>${product.price.toFixed(0)}</div>
            <div className={styles.priceLabel}>Price</div>
          </div>
          
          {isOutOfStock ? (
            <div className={styles.swipeContainer} style={{ justifyContent: 'center', opacity: 0.6 }}>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>Sold Out</span>
            </div>
          ) : (
            <div className={styles.swipeContainer}>
              <motion.div 
                style={{ 
                  position: 'absolute', inset: 0, borderRadius: '32px', 
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  opacity: bgOpacity
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
                className={`neumorphic-btn ${styles.swipeThumb}`}
              >
                <ChevronRight size={22} />
              </motion.div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
