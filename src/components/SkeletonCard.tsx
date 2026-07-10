import React from 'react';
import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.image} />
      <div className={styles.title} />
      <div className={styles.price} />
    </div>
  );
}
