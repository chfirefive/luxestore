import React, { useEffect, useState } from 'react';

/**
 * Simple dark mode toggle. Stores user preference in localStorage under
 * `theme` key with values `light` or `dark`. The component adds a CSS class
 * `dark-mode` to the <html> element when dark mode is active. Styles for the
 * dark theme should be defined globally (e.g., using CSS variables). This
 * component can be placed anywhere in the UI, such as the Navbar.
 */
export const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // Initialise from localStorage
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored === 'dark' : prefersDark;
    setIsDark(initial);
    updateHtmlClass(initial);
  }, []);

  const updateHtmlClass = (dark: boolean) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark-mode');
      html.classList.remove('light-mode');
    } else {
      html.classList.add('light-mode');
      html.classList.remove('dark-mode');
    }
  };

  const toggle = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    updateHtmlClass(newVal);
  };

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
