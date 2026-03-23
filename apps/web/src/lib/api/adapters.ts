import type { Listing } from '@/data/mock-listings';
import type { Store } from '@/data/mock-stores';
import type { ApiListing, ApiStorePublicResponse } from '@/lib/api/types';

const GRADIENT_PALETTE: Array<[string, string]> = [
  ['#60a5fa', '#1d4ed8'],
  ['#67e8f9', '#0891b2'],
  ['#6ee7b7', '#059669'],
  ['#c4b5fd', '#7c3aed'],
  ['#f9a8d4', '#db2777'],
  ['#fbbf24', '#d97706'],
  ['#34d399', '#047857'],
  ['#818cf8', '#4338ca'],
];

function toHash(text: string): number {
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickGradient(seed: string): [string, string] {
  return GRADIENT_PALETTE[toHash(seed) % GRADIENT_PALETTE.length];
}

function toTitleCase(value: string): string {
  const lower = value.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function toSellerType(value: ApiListing['sellerType']): Listing['sellerType'] {
  return value === 'STORE' ? 'store' : 'personal';
}

function toCondition(value: ApiListing['condition']): Listing['condition'] {
  return value === 'NEW' ? 'new' : 'used';
}

function toStoreLabel(isFeatured?: boolean): string {
  return isFeatured ? 'Featured Store' : 'Campus Store';
}

function toPrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function toTagline(description?: string | null): string {
  const text = (description || '').trim();
  if (!text) return 'Student-run storefront on DIUPoint';

  const firstSentence = text.split(/[.!?]/)[0]?.trim();
  if (!firstSentence) return 'Student-run storefront on DIUPoint';

  return firstSentence;
}

export function mapApiListingToUi(apiListing: ApiListing): Listing {
  const isStore = apiListing.sellerType === 'STORE';
  const [gradientFrom, gradientTo] = pickGradient(
    apiListing.id || apiListing.slug
  );

  const sellerName =
    isStore && apiListing.storeProfile?.storeName
      ? apiListing.storeProfile.storeName
      : apiListing.user?.fullName || 'DIU Seller';

  return {
    id: apiListing.id,
    slug: apiListing.slug,
    title: apiListing.title,
    description: apiListing.description,
    category: apiListing.category,
    condition: toCondition(apiListing.condition),
    price: toPrice(apiListing.price),
    location: apiListing.location,
    seller: sellerName,
    sellerType: toSellerType(apiListing.sellerType),
    storeSlug: apiListing.storeProfile?.slug,
    storeLabel: isStore
      ? toStoreLabel(apiListing.storeProfile?.isFeatured)
      : undefined,
    sellerSummary: apiListing.storeProfile?.description || undefined,
    isSellerVerified: apiListing.user?.verificationStatus === 'VERIFIED',
    postedAt: apiListing.createdAt,
    imageUrl: apiListing.images?.[0]?.imageUrl,
    images: apiListing.images?.map((image) => image.imageUrl),
    gradientFrom,
    gradientTo,
  };
}

export function mapApiStoreToUi(payload: ApiStorePublicResponse): {
  store: Store;
  listings: Listing[];
} {
  const mappedListings = payload.listings.map(mapApiListingToUi);
  const firstCategory = mappedListings[0]?.category || 'Marketplace';
  const tagline = toTagline(payload.store.description);

  return {
    store: {
      id: payload.store.id,
      slug: payload.store.slug,
      name: payload.store.storeName,
      tagline,
      shortTagline: tagline,
      description:
        payload.store.description?.trim() ||
        'Student-run storefront serving DIU students.',
      logoPlaceholder: initialsFromName(payload.store.storeName),
      coverImage: payload.store.bannerUrl || undefined,
      categoryFocus: toTitleCase(firstCategory),
      productCount: payload.summary.listingCount,
      isVerified: payload.store.owner.verificationStatus === 'VERIFIED',
      joinedAt: payload.store.createdAt,
      isFeatured: payload.store.isFeatured,
    },
    listings: mappedListings,
  };
}
