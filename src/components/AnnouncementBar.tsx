"use client";

import { useEffect, useState } from 'react';
import { listenToSettings, StoreSettings } from '@/lib/firebaseDb';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const unsub = listenToSettings(setSettings);
    return () => unsub();
  }, []);

  if (!settings || settings.showAnnouncement === false || !settings.announcementText) {
    return null;
  }

  return (
    <div className={styles.announcementBar}>
      <div className={styles.tickerContainer}>
        <div className={styles.tickerText}>
          {settings.announcementText} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; {settings.announcementText} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; {settings.announcementText}
        </div>
      </div>
    </div>
  );
}
