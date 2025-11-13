'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-12 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 dark:from-cyan-500 dark:via-blue-500 dark:to-indigo-500 dark:hover:shadow-cyan-500/50"
      aria-label="Toggle theme"
    >
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Light mode icon (Sun) */}
        <svg
          className={`absolute h-6 w-6 text-amber-500 transition-all duration-500 ${
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Dark mode icon (Moon) */}
        <svg
          className={`absolute h-6 w-6 text-indigo-400 transition-all duration-500 ${
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>

        {/* Animated glow effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
      </span>
    </button>
  );
}
