'use client';

import CategoryChip from '@/components/ui/category-chip';
import { CATEGORIES } from '@/data/mock-listings';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="w-full border-b border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        {/* Chip scroller owns its own horizontal padding so chips never clip on mobile scroll */}
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              active={activeCategory === cat.id}
              onClick={() => onCategoryChange(cat.id)}
            />
          ))}
          {/* trailing spacer so the last chip clears the viewport edge on scroll */}
          <div
            className="shrink-0 w-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
