'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';

function SearchInput({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-full rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center sm:left-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4 text-gray-400 dark:text-slate-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <input
        type="search"
        placeholder="Search items, books, electronics, housing..."
        className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-indigo-500/40 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-indigo-500/15 sm:pl-11 sm:pr-5 sm:py-3"
      />
    </div>
  );
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted && theme === 'dark';

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-sm transition-colors duration-200">
      <Container>
        {/*
          Mobile  → two rows: [logo + actions] then [search]
          Desktop → single row: logo | search | actions
        */}
        <div className="flex items-center gap-2 py-2.5 sm:h-18 sm:gap-6 sm:py-0 lg:gap-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
          >
            <span className="text-[22px] font-black tracking-tight text-[#2F3FBF] dark:text-indigo-400 sm:text-2xl">
              DIUPoint
            </span>
          </Link>

          {/* Search — center column on desktop only */}
          <SearchInput className="hidden flex-1 sm:block" />

          {/* Action group */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:gap-2.5">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:w-10"
            >
              {/* Show sun in dark mode, moon in light mode */}
              {mounted && isDark ? (
                /* Sun icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              ) : (
                /* Moon icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 12c0 5.385 4.365 9.75 9.75 9.75 4.862 0 8.923-3.543 9.702-8.198a9.75 9.75 0 0 1-.7 1.2z"
                  />
                </svg>
              )}
            </button>

            {/* Post Item */}
            <Button
              variant="primary"
              className="h-9 gap-0.5 px-3 text-xs sm:h-10 sm:gap-1.5 sm:px-5 sm:text-sm"
            >
              <span className="text-sm font-light leading-none sm:text-base">
                +
              </span>
              Post Item
            </Button>

            {/* Sign In */}
            <button
              type="button"
              className="flex h-9 items-center rounded-xl border border-gray-200 dark:border-slate-600 px-3 text-xs font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-indigo-500/40 hover:bg-[#2F3FBF]/5 dark:hover:bg-indigo-500/10 hover:text-[#2F3FBF] dark:hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:px-5 sm:text-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Search row — mobile only */}
        <div className="px-0.5 pb-3 pt-1.5 sm:hidden">
          <SearchInput />
        </div>
      </Container>
    </header>
  );
}
