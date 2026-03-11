'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-14 items-center gap-3 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
          >
            <span className="text-xl font-bold tracking-tight text-[#2F3FBF]">
              DIUPoint
            </span>
          </Link>

          {/* Search bar */}
          <div className="relative mx-auto w-full max-w-2xl flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
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
              placeholder="Search items, textbooks, furniture, or housing..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#2F3FBF] focus:bg-white focus:ring-2 focus:ring-[#2F3FBF]/20"
            />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="primary"
              className="hidden sm:inline-flex"
            >
              + Post Item
            </Button>
            <Button variant="ghost">Sign In</Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
