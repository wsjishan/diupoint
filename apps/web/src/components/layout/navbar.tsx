'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import Container from '@/components/ui/container';
import VerificationTick from '@/components/ui/verification-tick';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import {
  APP_ROUTES,
  createVerifyAccountHref,
} from '@/lib/routes';

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
        placeholder="Search DIUPoint"
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:placeholder-transparent outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/8 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10 sm:pl-11 sm:pr-11 sm:py-2.5"
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
  const router = useRouter();
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
  const [openMenuForUserId, setOpenMenuForUserId] = useState<string | null>(
    null
  );
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isAccountMenuOpen = Boolean(
    currentUser && openMenuForUserId === currentUser.id
  );
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target || !accountMenuRef.current) {
        return;
      }

      if (!accountMenuRef.current.contains(target)) {
        setOpenMenuForUserId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenuForUserId(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const isDark = mounted && theme === 'dark';
  const isVerified = verificationStatus === 'VERIFIED';
  const accountFirstName =
    currentUser?.fullName?.trim().split(/\s+/)[0] ?? 'Account';
  const accountMenuItemClass =
    'flex h-10 items-center rounded-lg px-3 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:bg-[#2F3FBF]/8 dark:hover:bg-white/8 hover:text-[#2F3FBF] dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  function closeAccountMenu() {
    setOpenMenuForUserId(null);
  }

  function toggleAccountMenu() {
    if (!currentUser) {
      return;
    }

    setOpenMenuForUserId((previous) =>
      previous === currentUser.id ? null : currentUser.id
    );
  }

  function handleLogout() {
    closeAccountMenu();
    logout();
  }

  function handleSearchSubmit(value: string) {
    if (onSearchSubmit) {
      onSearchSubmit(value);
      return;
    }

    const query = value.trim();
    if (!query) {
      router.push(APP_ROUTES.search);
      return;
    }

    router.push(`${APP_ROUTES.search}?q=${encodeURIComponent(query)}`);
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
            href={APP_ROUTES.home}
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
            onSubmit={handleSearchSubmit}
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
              href={APP_ROUTES.postItem}
              className="group inline-flex h-9 items-center justify-center gap-0.5 rounded-xl border border-white/25 bg-linear-to-r from-[#2F3FBF] to-[#3F5BFF] px-3 text-xs font-semibold text-white shadow-sm shadow-indigo-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-900/30 active:translate-y-0 active:from-[#2535a8] active:to-[#3249db] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <span className="text-sm leading-none sm:text-base">
                +
              </span>
              Post Item
            </Link>

            {/* Sign In */}
            {!isLoading && isAuthenticated ? (
              <>
                <div
                  ref={accountMenuRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={toggleAccountMenu}
                    aria-haspopup="menu"
                    aria-expanded={isAccountMenuOpen}
                    aria-controls="account-menu"
                    className="inline-flex h-9 items-center rounded-xl border border-gray-200 dark:border-white/10 px-2 text-xs font-medium text-gray-700 dark:text-slate-200 transition-all hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:gap-2 sm:px-3 sm:text-sm"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2F3FBF]/10 text-[#2F3FBF] dark:bg-indigo-300/15 dark:text-indigo-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                        />
                      </svg>
                    </span>
                    <span className="hidden max-w-[8rem] truncate sm:block">
                      {accountFirstName}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      className={`hidden h-4 w-4 transition-transform sm:block ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>

                  {isAccountMenuOpen ? (
                    <div
                      id="account-menu"
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(90vw,20rem)] sm:w-72 overflow-hidden rounded-2xl border border-gray-200/95 bg-white/98 p-2 shadow-xl shadow-gray-900/12 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/98 dark:shadow-black/35"
                    >
                      <div className="mb-1 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 dark:border-white/8 dark:bg-white/5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {currentUser?.fullName ?? 'Account'}
                            </p>
                            <p
                              className="truncate text-xs text-gray-500 dark:text-slate-400"
                              title={currentUser?.email}
                            >
                              {currentUser?.email}
                            </p>
                          </div>

                          {isVerified ? (
                            <VerificationTick className="shrink-0" />
                          ) : (
                            <span className="shrink-0 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={APP_ROUTES.myListings}
                          role="menuitem"
                          onClick={closeAccountMenu}
                          className={accountMenuItemClass}
                        >
                          My Listings
                        </Link>

                        <Link
                          href={APP_ROUTES.cart}
                          role="menuitem"
                          onClick={closeAccountMenu}
                          className={`${accountMenuItemClass} justify-between`}
                        >
                          <span>Cart</span>
                          {quantityCount > 0 ? (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#2F3FBF] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                              {quantityCount}
                            </span>
                          ) : null}
                        </Link>

                        <Link
                          href={APP_ROUTES.orders}
                          role="menuitem"
                          onClick={closeAccountMenu}
                          className={accountMenuItemClass}
                        >
                          Orders
                        </Link>

                        <Link
                          href={APP_ROUTES.favorites}
                          role="menuitem"
                          onClick={closeAccountMenu}
                          className={accountMenuItemClass}
                        >
                          Saved Items
                        </Link>

                        {!isVerified ? (
                          <Link
                            href={createVerifyAccountHref(APP_ROUTES.home)}
                            role="menuitem"
                            onClick={closeAccountMenu}
                            className={accountMenuItemClass}
                          >
                            Verify Account
                          </Link>
                        ) : null}
                      </div>

                      <div className="my-1 border-t border-gray-100 dark:border-white/8" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-300/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                href={APP_ROUTES.signIn}
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
            onSubmit={handleSearchSubmit}
          />
        </div>
      </Container>
    </header>
  );
}
