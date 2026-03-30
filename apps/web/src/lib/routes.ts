export const APP_ROUTES = {
  home: '/',
  search: '/search',
  recentListings: '/listings/recent',
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  authCallback: '/auth/callback',
  cart: '/cart',
  checkout: '/checkout',
  favorites: '/favorites',
  orders: '/orders',
  postItem: '/post-item',
  myListings: '/my-listings',
  storeDashboard: '/store-dashboard',
  verifyAccount: '/verify-account',
} as const;

export const AUTH_PAGES = [
  APP_ROUTES.signIn,
  APP_ROUTES.signUp,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.authCallback,
] as const;

export const PROTECTED_PAGES = [
  APP_ROUTES.cart,
  APP_ROUTES.checkout,
  APP_ROUTES.favorites,
  APP_ROUTES.orders,
  APP_ROUTES.postItem,
  APP_ROUTES.myListings,
  APP_ROUTES.storeDashboard,
  APP_ROUTES.verifyAccount,
] as const;

export function sanitizeReturnTo(
  returnTo: string | null | undefined,
  fallback: string = APP_ROUTES.home
): string {
  const normalizedReturnTo = returnTo?.trim();

  if (!normalizedReturnTo) {
    return fallback;
  }

  if (!normalizedReturnTo.startsWith('/')) {
    return fallback;
  }

  if (normalizedReturnTo.startsWith('//')) {
    return fallback;
  }

  return normalizedReturnTo;
}

export function createSignInHref(returnTo?: string | null): string {
  const safeReturnTo = sanitizeReturnTo(returnTo, APP_ROUTES.home);
  return `${APP_ROUTES.signIn}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function createVerifyAccountHref(returnTo?: string | null): string {
  const safeReturnTo = sanitizeReturnTo(returnTo, APP_ROUTES.home);
  return `${APP_ROUTES.verifyAccount}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function createListingHref(slug: string): string {
  return `/listing/${encodeURIComponent(slug)}`;
}

export function createStoreHref(slug: string): string {
  return `/store/${encodeURIComponent(slug)}`;
}

export function createMyListingEditHref(listingId: string): string {
  return `${APP_ROUTES.myListings}/${encodeURIComponent(listingId)}/edit`;
}

export function createMyListingsUpdatedHref(): string {
  return `${APP_ROUTES.myListings}?updated=1`;
}
