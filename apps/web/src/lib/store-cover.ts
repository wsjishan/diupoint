const COVER_IMAGE_OVERLAY =
  'linear-gradient(135deg, rgba(2, 6, 23, 0.76), rgba(30, 27, 75, 0.68))';

export const DEFAULT_STORE_COVER_GRADIENT =
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #1e3a8a 100%)';

const SEEDED_DEFAULT_BANNER_URLS = new Set<string>([
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80',
]);

function isSeededDefaultCover(coverImage: string): boolean {
  if (coverImage.startsWith('/images/stores/')) {
    return true;
  }

  return SEEDED_DEFAULT_BANNER_URLS.has(coverImage);
}

export function resolveStoreCoverBackgroundImage(
  coverImage?: string | null
): string {
  const trimmedCoverImage = coverImage?.trim();

  if (trimmedCoverImage && !isSeededDefaultCover(trimmedCoverImage)) {
    return `${COVER_IMAGE_OVERLAY}, url(${trimmedCoverImage})`;
  }

  return DEFAULT_STORE_COVER_GRADIENT;
}
