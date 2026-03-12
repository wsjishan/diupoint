'use client';

import { useState } from 'react';
import CategoryChip from '@/components/ui/category-chip';
import Container from '@/components/ui/container';
import { CATEGORIES } from '@/data/mock-listings';

export default function CategoryFilter() {
  const [active, setActive] = useState('all');

  return (
    <div className="w-full border-b border-gray-100 bg-white py-4">
      <Container>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-0.5">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              active={active === cat.id}
              onClick={() => setActive(cat.id)}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
