"use client";

import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/lib/firebaseDb';
import styles from './ProductDetails.module.css';

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [comments, setComments] = useState<{ id: number, user: string, text: string, date: string }[]>([
    { id: 1, user: 'Alex D.', text: 'Absolutely stunning quality. Highly recommend.', date: '2 days ago' },
    { id: 2, user: 'Sarah M.', text: 'Fast delivery and excellent packaging.', date: '5 days ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: 'Guest User', text: newComment, date: 'Just now' }
    ]);
    setNewComment('');
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.productLayout}>
        
        <div className={styles.imageSection} style={{ background: product.imageUrl ? 'transparent' : 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', fontStyle: 'italic' }}>
              {product.description}
            </p>
          )}
        </div>

        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.stats}>
            <span>🔥 Popular Item</span>
            <span>•</span>
            <span>💬 {comments.length} Comments</span>
          </div>

          <div className={styles.price}>${product.price.toFixed(2)}</div>
          
          <p className={styles.description}>{product.description}</p>
          
          <div className={styles.actions}>
            <AddToCartButton product={product} />
          </div>
        </div>

      </div>

      <div className={styles.commentsSection}>
        <h2 className="title" style={{ fontSize: '1.8rem' }}>Customer Reviews</h2>
        
        <div className={styles.commentList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <span>{comment.user}</span>
                <span className={styles.commentDate}>{comment.date}</span>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.commentForm}>
          <textarea 
            className={styles.commentInput} 
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleAddComment}>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
