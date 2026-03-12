'use client';

import Link from 'next/link';
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
          className="h-4 w-4 text-gray-400"
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
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 focus:bg-white focus:ring-2 focus:ring-[#2F3FBF]/15 sm:pl-11 sm:pr-5 sm:py-3"
      />
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
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
            <span className="text-[22px] font-black tracking-tight text-[#2F3FBF] sm:text-2xl">
              DIUPoint
            </span>
          </Link>

          {/* Search — center column on desktop only */}
          <SearchInput className="hidden flex-1 sm:block" />

          {/* Action group */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:gap-2.5">
            {/* Dark mode icon */}
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 sm:h-10 sm:w-10"
            >
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
              className="flex h-9 items-center rounded-xl border border-gray-200 px-3 text-xs font-medium text-gray-600 transition-all hover:border-[#2F3FBF]/40 hover:bg-[#2F3FBF]/5 hover:text-[#2F3FBF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 sm:h-10 sm:px-5 sm:text-sm"
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
