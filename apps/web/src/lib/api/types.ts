export type ApiVerificationStatus = 'VERIFIED' | 'UNVERIFIED';
export type ApiSellerType = 'PERSONAL' | 'STORE';
export type ApiListingCondition = 'NEW' | 'USED';

export interface ApiListingImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ApiUserSummary {
  id: string;
  fullName: string;
  email?: string;
  accountType?: string;
  verificationStatus: ApiVerificationStatus;
}

export interface ApiStoreProfileSummary {
  id: string;
  storeName: string;
  slug: string;
  description?: string | null;
  isFeatured?: boolean;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

export interface ApiListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  condition: ApiListingCondition;
  price: number | string;
  location: string;
  sellerType: ApiSellerType;
  createdAt: string;
  images?: ApiListingImage[];
  user?: ApiUserSummary;
  storeProfile?: ApiStoreProfileSummary | null;
}

export interface ApiStorePublicResponse {
  store: {
    id: string;
    slug: string;
    storeName: string;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    isFeatured: boolean;
    createdAt: string;
    owner: ApiUserSummary;
  };
  listings: ApiListing[];
  summary: {
    listingCount: number;
  };
}

export interface ApiAuthUser {
  id: string;
  fullName: string;
  email: string;
  accountType: 'PERSONAL' | 'STORE';
  verificationStatus: ApiVerificationStatus;
  verifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storeProfile: {
    id: string;
    storeName: string;
    slug: string;
    isFeatured: boolean;
    logoUrl: string | null;
    bannerUrl: string | null;
  } | null;
}

export interface ApiSignInResponse {
  accessToken: string;
  user: ApiAuthUser;
}
