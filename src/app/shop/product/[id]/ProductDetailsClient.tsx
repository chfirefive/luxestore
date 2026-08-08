"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Heart, ChevronRight, ChevronsDown } from 'lucide-react';
import { addToCart, Product } from '@/lib/firebaseDb';
import styles from './ProductDetails.module.css';

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['9', '9.5', '10', '10.5'];
  const colors = product.colors && product.colors.length > 0 ? product.colors : [
    { name: 'Default', hex: product.backgroundGradient?.includes('linear') ? product.backgroundGradient.split(',')[1].trim() : (product.backgroundGradient || '#10b981') }
  ];
  
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // Swipe logic for Add to Cart
  const x = useMotionValue(0);
  const swipeControls = useAnimation();
  const maxSwipe = 180; // Distance to trigger add to cart
  const swipeOpacity = useTransform(x, [0, maxSwipe], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxSwipe], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x >= maxSwipe - 20 && !isOutOfStock) {
      // Trigger add to cart
      addToCart(product, selectedSize, selectedColor.hex);
      swipeControls.start({ x: maxSwipe });
      setTimeout(() => {
        router.push('/cart');
      }, 600);
    } else {
      // Snap back
      swipeControls.start({ x: 0 });
    }
  };

  const bgStyle = product.backgroundGradient || 'linear-gradient(135deg, #e0eafc, #cfdef3)';
  const boxImg = product.boxImageUrl || '/shoebox_placeholder.png'; // Will gracefully fallback if missing
  const brandName = product.name.split(' ')[0].toUpperCase();

  return (
    <div className={styles.pageContainer}>
      
      {/* Dynamic Background Shape */}
      <div 
        className={styles.bgShape} 
        style={{ background: bgStyle }}
      />
      
      {/* Floating Top Nav */}
      <div className={styles.topNav}>
        <button onClick={() => router.back()} className={`neumorphic-btn ${styles.navBtn}`}>
          <ArrowLeft size={24} />
        </button>
        <button onClick={() => router.push('/cart')} className={`neumorphic-btn ${styles.navBtn}`} style={{ position: 'relative' }}>
          <ShoppingBag size={24} />
          <span className={styles.cartBadge}>2</span>
        </button>
      </div>

      <div className={styles.contentWrapper}>
        
        {/* LEFT COLUMN: Visuals */}
        <div className={styles.leftColumn}>
          <div className={styles.headerInfo}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productSubtitle}>{product.categorySlug} shoes</p>
          </div>
          
          <div className={styles.bigBgText}>{brandName}</div>
          
          {product.imageUrl && (
            <motion.img 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
              src={product.imageUrl} 
              alt={product.name} 
              className={styles.productImage}
            />
          )}

          {/* Shoebox area (Mobile mainly, or bottom of left col) */}
          <div style={{ marginTop: 'auto', position: 'relative', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '20px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
              <ChevronsDown size={20} color="var(--text-main)" style={{ marginBottom: '5px' }} />
              <ShoppingBag size={24} color="var(--text-main)" />
            </div>
            {product.boxImageUrl && (
              <img src={product.boxImageUrl} alt="Shoebox" style={{ width: '100%', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }} />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className={styles.rightColumn}>
          
          {/* Size Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className={styles.sectionTitle}>Size</h3>
              <button 
                onClick={() => setIsFavorite(!isFavorite)} 
                className={`neumorphic-btn ${styles.navBtn} ${isFavorite ? 'active' : ''}`}
                style={{ width: '40px', height: '40px' }}
              >
                <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : 'currentColor'} />
              </button>
            </div>
            
            <div className={styles.sizeGrid}>
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`neumorphic-btn ${styles.sizeBtn} ${selectedSize === size ? 'active' : ''}`}
                  style={{ color: selectedSize === size ? 'var(--primary)' : 'inherit' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div style={{ marginTop: '1rem' }}>
            <h3 className={styles.sectionTitle}>Color</h3>
            <div className={styles.colorGrid}>
              {colors.map(color => (
                <div 
                  key={color.name + color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`neumorphic-btn ${styles.colorBtn} ${selectedColor.name === color.name ? 'active' : ''}`}
                  title={color.name}
                >
                  <div className={styles.colorInner} style={{ background: color.hex }} />
                </div>
              ))}
            </div>
          </div>

          {/* Price & Swipe to Buy */}
          <div className={styles.bottomAction}>
            <div className={styles.price}>${product.price.toFixed(0)}</div>
            
            {isOutOfStock ? (
              <div className={styles.swipeContainer} style={{ justifyContent: 'center', opacity: 0.5 }}>
                <span style={{ fontWeight: 600 }}>Sold Out</span>
              </div>
            ) : (
              <div className={styles.swipeContainer}>
                {/* Success background that reveals */}
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
                  <ChevronRight size={24} />
                </motion.div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
