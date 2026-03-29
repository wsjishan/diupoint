import { cn } from '@/lib/utils';

interface VerificationTickProps {
  className?: string;
  title?: string;
  ariaLabel?: string;
}

export default function VerificationTick({
  className,
  title = 'Verified',
  ariaLabel = 'Verified',
}: VerificationTickProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/20 ring-1 ring-white/80 dark:ring-slate-900/70',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="h-2.5 w-2.5 text-white"
        aria-hidden="true"
      >
        <path
          d="M3.5 8.25l2.5 2.5 6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
