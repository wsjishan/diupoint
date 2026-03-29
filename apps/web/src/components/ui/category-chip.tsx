'use client';

import { ReactNode } from 'react';

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

export default function CategoryChip({
  label,
  active = false,
  onClick,
  icon,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-1 ${
        active
          ? 'border border-[#2F3FBF]/30 dark:border-indigo-300/45 bg-[#2F3FBF]/8 dark:bg-indigo-400/16 text-[#2F3FBF] dark:text-indigo-200'
          : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-slate-300 hover:border-[#2F3FBF]/40 dark:hover:border-white/20 hover:bg-[#2F3FBF]/5 dark:hover:bg-white/5 hover:text-[#2F3FBF] dark:hover:text-slate-100'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
