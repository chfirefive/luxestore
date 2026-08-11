import React, { useState, useCallback } from 'react';

/**
 * Simple dark mode toggle. Stores user preference in localStorage under
 * `theme` key with values `light` or `dark`. The component adds a CSS class
 * `dark-mode` to the <html> element when dark mode is active. Styles for the
 * dark theme should be defined globally (e.g., using CSS variables). This
 * component can be placed anywhere in the UI, such as the Navbar.
 */

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (dark) {
    html.classList.add('dark-mode');
    html.classList.remove('light-mode');
  } else {
    html.classList.add('light-mode');
    html.classList.remove('dark-mode');
  }
}

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'dark';
  return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
}

export const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const initial = getInitialDark();
    applyTheme(initial);
    return initial;
  });

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      applyTheme(newVal);
      return newVal;
    });
  }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={isDark}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        fontSize: '1.2rem',
        color: 'var(--text-main)'
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};
