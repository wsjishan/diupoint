export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortTagline: string;
  description: string;
  logoPlaceholder: string;
  coverImage?: string;
  categoryFocus: string;
  productCount: number;
  isVerified: boolean;
  joinedAt: string;
  isFeatured: boolean;
}

export const STORES: Store[] = [
  {
    id: 's1',
    slug: 'gadget-grove',
    name: 'Gadget Grove',
    tagline: 'Trusted tech picks for campus life',
    shortTagline: 'Trusted tech picks for campus life',
    description:
      'A curated electronics store focused on productivity and student-friendly gadgets.',
    logoPlaceholder: 'GG',
    coverImage: '/images/stores/gadget-grove-cover.jpg',
    categoryFocus: 'Electronics',
    productCount: 42,
    isVerified: true,
    joinedAt: '2023-09-18',
    isFeatured: true,
  },
  {
    id: 's2',
    slug: 'campus-coffee',
    name: 'Campus Coffee',
    tagline: 'Brew gear and cozy room staples',
    shortTagline: 'Brew gear and cozy room staples',
    description:
      'From coffee tools to compact appliances, this store brings comfort to dorm living.',
    logoPlaceholder: 'CC',
    coverImage: '/images/stores/campus-coffee-cover.jpg',
    categoryFocus: 'Room Essentials',
    productCount: 31,
    isVerified: true,
    joinedAt: '2024-01-07',
    isFeatured: true,
  },
  {
    id: 's3',
    slug: 'techhub-diu',
    name: 'TechHub DIU',
    tagline: 'Accessories, audio, and daily carry',
    shortTagline: 'Accessories, audio, and daily carry',
    description:
      'A popular campus tech storefront with practical accessories and verified quality checks.',
    logoPlaceholder: 'TH',
    coverImage: '/images/stores/techhub-diu-cover.jpg',
    categoryFocus: 'Electronics',
    productCount: 58,
    isVerified: true,
    joinedAt: '2023-05-26',
    isFeatured: true,
  },
  {
    id: 's4',
    slug: 'bookbarn-diu',
    name: 'BookBarn DIU',
    tagline: 'Semester books, notes, and bundles',
    shortTagline: 'Semester books, notes, and bundles',
    description:
      'Specialized in textbooks, references, and academic bundles for DIU students.',
    logoPlaceholder: 'BB',
    coverImage: '/images/stores/bookbarn-diu-cover.jpg',
    categoryFocus: 'Books & Notes',
    productCount: 64,
    isVerified: true,
    joinedAt: '2022-11-11',
    isFeatured: true,
  },
  {
    id: 's5',
    slug: 'dorm-decor-studio',
    name: 'Dorm Decor Studio',
    tagline: 'Make every dorm room feel like home',
    shortTagline: 'Make every dorm room feel like home',
    description:
      'Furniture accents and decor packages designed for compact student spaces.',
    logoPlaceholder: 'DD',
    coverImage: '/images/stores/dorm-decor-studio-cover.jpg',
    categoryFocus: 'Housing & Decor',
    productCount: 27,
    isVerified: true,
    joinedAt: '2024-04-15',
    isFeatured: false,
  },
  {
    id: 's6',
    slug: 'study-corner',
    name: 'Study Corner',
    tagline: 'Smart study tools and desk essentials',
    shortTagline: 'Smart study tools and desk essentials',
    description:
      'Focused on study productivity with practical supplies and desk optimization kits.',
    logoPlaceholder: 'SC',
    coverImage: '/images/stores/study-corner-cover.jpg',
    categoryFocus: 'Books & Notes',
    productCount: 36,
    isVerified: false,
    joinedAt: '2024-08-03',
    isFeatured: false,
  },
];

export const FEATURED_STORES = STORES.filter((store) => store.isFeatured);

export const STORE_SPOTLIGHT = STORES.find(
  (store) => store.slug === 'techhub-diu'
);

export function getStoreBySlug(slug: string) {
  return STORES.find((store) => store.slug === slug);
}
