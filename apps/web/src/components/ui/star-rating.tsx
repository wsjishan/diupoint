'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function StarIcon({
  fill,
  className,
  gradientId,
}: {
  fill: 'full' | 'half' | 'empty';
  className?: string;
  gradientId: string;
}) {
  if (fill === 'full') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-amber-400', className)}
        aria-hidden="true"
      >
        <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
      </svg>
    );
  }

  if (fill === 'half') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('text-gray-300 dark:text-slate-600', className)}
      aria-hidden="true"
    >
      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
    </svg>
  );
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'sm',
  showValue = false,
  className,
}: StarRatingProps) {
  const uniqueId = useId();

  const stars = Array.from({ length: maxStars }, (_, i) => {
    const starIndex = i + 1;
    if (rating >= starIndex) return 'full' as const;
    if (rating >= starIndex - 0.5) return 'half' as const;
    return 'empty' as const;
  });

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {stars.map((fill, index) => (
        <StarIcon
          key={index}
          fill={fill}
          className={sizeClasses[size]}
          gradientId={`${uniqueId}-star-${index}`}
        />
      ))}
      {showValue ? (
        <span
          className={cn(
            'ml-1 font-semibold text-gray-700 dark:text-slate-200',
            textSizeClasses[size]
          )}
        >
          {rating.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
