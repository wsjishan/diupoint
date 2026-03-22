'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  'linear-gradient(135deg, #eff6ff, #e2e8f0)',
  'linear-gradient(135deg, #f8fafc, #e0e7ff)',
];

function getFallbackGradient(seed: string): string {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

interface ListingImageGalleryProps {
  title: string;
  images?: string[];
  fallbackSeed: string;
}

export default function ListingImageGallery({
  title,
  images,
  fallbackSeed,
}: ListingImageGalleryProps) {
  const validImages = useMemo(
    () => (images ?? []).filter((image) => image.trim().length > 0),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});

  const activeImage = validImages[activeIndex] ?? '';
  const showActiveImage = activeImage.length > 0 && !failedImages[activeImage];
  const fallbackBackground = getFallbackGradient(fallbackSeed);

  function markImageFailed(image: string) {
    setFailedImages((previous) => ({
      ...previous,
      [image]: true,
    }));
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-4">
      <div
        className="relative aspect-4/3 overflow-hidden rounded-xl"
        style={
          showActiveImage
            ? undefined
            : {
                background: fallbackBackground,
              }
        }
      >
        {showActiveImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
            onError={() => markImageFailed(activeImage)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
              Image unavailable
            </div>
          </div>
        )}
      </div>

      {validImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {validImages.map((image, index) => {
            const isActive = index === activeIndex;
            const showThumb = !failedImages[image];

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`View image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border transition-colors ${
                  isActive
                    ? 'border-[#2F3FBF] ring-2 ring-[#2F3FBF]/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20'
                }`}
              >
                {showThumb ? (
                  <Image
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    sizes="120px"
                    className="h-full w-full object-cover"
                    onError={() => markImageFailed(image)}
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: fallbackBackground }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
