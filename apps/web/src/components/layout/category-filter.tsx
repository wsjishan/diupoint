'use client';

import CategoryChip from '@/components/ui/category-chip';
import {
  CATEGORIES,
  type ListingCondition,
} from '@/data/mock-listings';

export type CategoryConditionFilter = 'all' | ListingCondition;

const CONDITION_CHIPS: Array<{
  id: CategoryConditionFilter;
  label: string;
}> = [
  { id: 'all', label: 'All conditions' },
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  activeCondition: CategoryConditionFilter;
  onConditionChange: (condition: CategoryConditionFilter) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  activeCondition,
  onConditionChange,
}: CategoryFilterProps) {
  return (
    <div className="w-full border-b border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        {/* Category chips row */}
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              active={activeCategory === cat.id}
              onClick={() => onCategoryChange(cat.id)}
            />
          ))}
          <div
            className="hidden sm:block h-6 w-px shrink-0 self-center bg-gray-200 dark:bg-white/10"
            aria-hidden="true"
          />
          {CONDITION_CHIPS.map((condition) => (
            <div
              key={condition.id}
              className="hidden sm:block"
            >
              <CategoryChip
                label={condition.label}
                active={activeCondition === condition.id}
                onClick={() => onConditionChange(condition.id)}
              />
            </div>
          ))}
          {/* trailing spacer so the last chip clears the viewport edge on scroll */}
          <div
            className="shrink-0 w-1"
            aria-hidden="true"
          />
        </div>

        {/* Mobile-only condition chips row */}
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 pb-2.5 sm:hidden">
          {CONDITION_CHIPS.map((condition) => (
            <CategoryChip
              key={`mobile-${condition.id}`}
              label={condition.label}
              active={activeCondition === condition.id}
              onClick={() => onConditionChange(condition.id)}
            />
          ))}
          <div
            className="shrink-0 w-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
