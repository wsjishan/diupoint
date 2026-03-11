'use client';

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryChip({
  label,
  active = false,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-1 ${
        active
          ? 'bg-[#2F3FBF] text-white shadow-sm'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-[#2F3FBF] hover:text-[#2F3FBF]'
      }`}
    >
      {label}
    </button>
  );
}
