'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  /** 'sidebar' = full-width nav-item style; 'icon' = compact icon-only button */
  variant?: 'sidebar' | 'icon';
}

export default function ThemeToggle({ variant = 'sidebar' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-5 h-5 flex-shrink-0 text-brand-400" />
      ) : (
        <Moon className="w-5 h-5 flex-shrink-0 text-brand-500" />
      )}
      <span className="text-sm font-medium">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
