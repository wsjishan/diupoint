'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';

interface SearchInputProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

function SearchInput({
  className = '',
  value,
  onChange,
  onSubmit,
}: SearchInputProps) {
  const isControlled =
    typeof value === 'string' && typeof onChange === 'function';
  const [internalValue, setInternalValue] = useState('');
  const resolvedValue = isControlled ? value : internalValue;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(resolvedValue.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full rounded-xl shadow-sm shadow-gray-900/3 transition-all duration-200 hover:shadow-md ${className}`}
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
        value={resolvedValue}
        onChange={(event) => {
          if (isControlled) {
            onChange(event.target.value);
            return;
          }

          setInternalValue(event.target.value);
        }}
        placeholder="Search items, books, electronics, housing..."
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/8 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10 sm:pl-11 sm:pr-11 sm:py-2.5"
      />
      <button
        type="submit"
        aria-label="Search marketplace"
        className="absolute inset-y-0 right-2 inline-flex items-center text-gray-400 transition-colors hover:text-[#2F3FBF] dark:text-slate-500 dark:hover:text-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
    </form>
  );
}

interface NavbarProps {
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}

export default function Navbar({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const {
    isAuthenticated,
    currentUser,
    verificationStatus,
    isLoading,
    logout,
  } = useAuth();
  const { quantityCount } = useCart();
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-sm transition-colors duration-200">
      <Container>
        {/*
          Mobile  → two rows: [logo + actions] then [search]
          Desktop → single row: logo | search | actions
        */}
        <div className="flex items-center gap-2 py-2.5 sm:h-16 sm:gap-6 sm:py-0 lg:gap-8">
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
          <SearchInput
            className="hidden flex-1 sm:block"
            value={searchQuery}
            onChange={onSearchQueryChange}
            onSubmit={onSearchSubmit}
          />

          {/* Action group */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:w-10"
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
            <Link
              href="/post-item"
              className="inline-flex h-9 items-center justify-center gap-0.5 rounded-lg bg-[#2F3FBF] px-3 text-xs font-medium text-white transition-colors duration-150 hover:bg-[#2535a8] active:bg-[#1e2d96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <span className="text-sm font-light leading-none sm:text-base">
                +
              </span>
              Post Item
            </Link>

            {/* Sign In */}
            {!isLoading && isAuthenticated ? (
              <>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
                    verificationStatus === 'VERIFIED'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : verificationStatus === 'PENDING'
                        ? 'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300'
                        : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-300'
                  }`}
                >
                  {verificationStatus === 'VERIFIED'
                    ? 'Verified'
                    : verificationStatus === 'PENDING'
                      ? 'Pending'
                      : 'Unverified'}
                </span>

                <Link
                  href="/my-listings"
                  className="hidden h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 lg:flex"
                >
                  My Listings
                </Link>

                <Link
                  href="/cart"
                  className="hidden h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 lg:flex"
                >
                  Cart
                  {quantityCount > 0 ? (
                    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#2F3FBF] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      {quantityCount}
                    </span>
                  ) : null}
                </Link>

                <Link
                  href="/orders"
                  className="hidden h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 lg:flex"
                >
                  Orders
                </Link>

                <Link
                  href="/favorites"
                  className="hidden h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 lg:flex"
                >
                  Saved Items
                </Link>

                <Link
                  href={
                    verificationStatus === 'VERIFIED'
                      ? '/'
                      : `/verify-account?returnTo=${encodeURIComponent('/')}`
                  }
                  className="hidden h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 lg:flex"
                  title={currentUser?.email}
                >
                  {currentUser?.fullName?.split(' ')[0] ?? 'Account'}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="flex h-9 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-xs font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:px-4 sm:text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="flex h-9 items-center rounded-xl border border-gray-200 dark:border-white/10 px-3 text-xs font-medium text-gray-600 dark:text-slate-300 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:px-4 sm:text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Search row — mobile only */}
        <div className="px-0.5 pb-2.5 pt-1.5 sm:hidden">
          <SearchInput
            value={searchQuery}
            onChange={onSearchQueryChange}
            onSubmit={onSearchSubmit}
          />
        </div>
      </Container>
    </header>
  );
}
