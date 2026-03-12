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
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-1 ${
        active
          ? 'bg-[#2F3FBF] text-white shadow-sm'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-[#2F3FBF]/40 hover:bg-[#2F3FBF]/5 hover:text-[#2F3FBF]'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
