import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Sync initially with either localStorage or current system configuration
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return true; // Default fall back
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:text-[var(--color-accent)] shadow-xl hover:shadow-[var(--color-accent)]/10 hover:scale-110 active:scale-95 transform transition-all duration-200 group backdrop-blur-md"
      title={isDark ? 'Switch to Royal Pink Light Theme' : 'Switch to Midnight Forest Dark Theme'}
      aria-label="Toggle Theme Paradigm"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 text-pink-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}