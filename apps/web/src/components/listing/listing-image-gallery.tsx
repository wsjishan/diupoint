'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

const IMAGE_LOAD_TIMEOUT_MS = 9000;

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
  const [loadedImages, setLoadedImages] = useState<Record<string, true>>({});

  const activeImage = validImages[activeIndex] ?? '';
  const showActiveImage = activeImage.length > 0 && !failedImages[activeImage];
  const fallbackBackground = getFallbackGradient(fallbackSeed);

  function markImageFailed(image: string) {
    setFailedImages((previous) => ({
      ...previous,
      [image]: true,
    }));
  }

  function markImageLoaded(image: string) {
    setLoadedImages((previous) => ({
      ...previous,
      [image]: true,
    }));
  }

  const showThumbnails = validImages.length > 1;

  useEffect(() => {
    if (!showActiveImage || !activeImage || loadedImages[activeImage]) {
      return;
    }

    const timer = window.setTimeout(() => {
      markImageFailed(activeImage);
    }, IMAGE_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeImage, loadedImages, showActiveImage]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-3">
      <div className="relative flex w-full aspect-4/3 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 lg:aspect-5/4">
        {showActiveImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-contain"
            onLoad={() => markImageLoaded(activeImage)}
            onError={() => markImageFailed(activeImage)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-200 via-blue-100 to-slate-100 opacity-40 blur-2xl dark:from-slate-800 dark:to-slate-900" />

            <div className="relative z-10 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Image unavailable
              </div>

              <div className="mt-1 text-xs text-slate-400">
                This listing image is not available right now.
              </div>
            </div>
          </div>
        )}
      </div>

      {showThumbnails ? (
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
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
                    onLoad={() => markImageLoaded(image)}
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
