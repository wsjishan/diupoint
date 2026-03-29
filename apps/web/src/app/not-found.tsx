import Link from 'next/link';

import { APP_ROUTES } from '@/lib/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white px-4 py-20 text-center dark:bg-slate-950">
      <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-slate-100">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
        The page you requested does not exist.
      </p>
      <Link
        href={APP_ROUTES.home}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
      >
        Go Home
      </Link>
    </div>
  );
}
