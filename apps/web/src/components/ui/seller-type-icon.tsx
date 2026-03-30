import { cn } from '@/lib/utils';

interface SellerTypeIconProps {
  sellerType: 'store' | 'personal';
  className?: string;
}

export default function SellerTypeIcon({
  sellerType,
  className,
}: SellerTypeIconProps) {
  const label = sellerType === 'store' ? 'Store Seller' : 'Personal Seller';

  return (
    <span
      className={cn(
        'group relative inline-flex shrink-0 cursor-default items-center',
        className,
      )}
    >
      <span
        role="img"
        aria-label={label}
        className="inline-flex h-3.5 w-3.5 items-center justify-center opacity-60"
      >
        {sellerType === 'store' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9l1.5-4.5h15L21 9m-18 0h18v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V9zm4.5 0v12m9-12v12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
            />
          </svg>
        )}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700">
        {label}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-slate-700" />
      </span>
    </span>
  );
}
