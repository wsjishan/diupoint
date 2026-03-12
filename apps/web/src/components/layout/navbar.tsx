'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <Container>
        <div className="flex h-18 items-center gap-6 sm:gap-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
          >
            <span className="text-2xl font-black tracking-tight text-[#2F3FBF]">
              DIUPoint
            </span>
          </Link>

          {/* Search bar */}
          <div className="relative w-full flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 focus:bg-white focus:ring-2 focus:ring-[#2F3FBF]/10"
            />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2.5">
            <Button
              variant="primary"
              className="hidden h-10 gap-1.5 px-5 text-sm sm:inline-flex"
            >
              <span className="text-base font-light leading-none">+</span>
              Post Item
            </Button>
            <button
              type="button"
              className="flex h-10 items-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-all hover:border-[#2F3FBF]/40 hover:bg-[#2F3FBF]/5 hover:text-[#2F3FBF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 sm:px-5"
            >
              Sign In
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
