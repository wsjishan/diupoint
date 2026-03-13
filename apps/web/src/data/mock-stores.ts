export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoPlaceholder: string;
  categoryFocus: string;
  productCount: number;
  isFeatured: boolean;
}

export const STORES: Store[] = [
  {
    id: 's1',
    slug: 'gadget-grove',
    name: 'Gadget Grove',
    tagline: 'Trusted tech picks for campus life',
    description:
      'A curated electronics store focused on productivity and student-friendly gadgets.',
    logoPlaceholder: 'GG',
    categoryFocus: 'Electronics',
    productCount: 42,
    isFeatured: true,
  },
  {
    id: 's2',
    slug: 'campus-coffee',
    name: 'Campus Coffee',
    tagline: 'Brew gear and cozy room staples',
    description:
      'From coffee tools to compact appliances, this store brings comfort to dorm living.',
    logoPlaceholder: 'CC',
    categoryFocus: 'Room Essentials',
    productCount: 31,
    isFeatured: true,
  },
  {
    id: 's3',
    slug: 'techhub-diu',
    name: 'TechHub DIU',
    tagline: 'Accessories, audio, and daily carry',
    description:
      'A popular campus tech storefront with practical accessories and verified quality checks.',
    logoPlaceholder: 'TH',
    categoryFocus: 'Electronics',
    productCount: 58,
    isFeatured: true,
  },
  {
    id: 's4',
    slug: 'bookbarn-diu',
    name: 'BookBarn DIU',
    tagline: 'Semester books, notes, and bundles',
    description:
      'Specialized in textbooks, references, and academic bundles for DIU students.',
    logoPlaceholder: 'BB',
    categoryFocus: 'Books & Notes',
    productCount: 64,
    isFeatured: true,
  },
  {
    id: 's5',
    slug: 'dorm-decor-studio',
    name: 'Dorm Decor Studio',
    tagline: 'Make every dorm room feel like home',
    description:
      'Furniture accents and decor packages designed for compact student spaces.',
    logoPlaceholder: 'DD',
    categoryFocus: 'Housing & Decor',
    productCount: 27,
    isFeatured: false,
  },
  {
    id: 's6',
    slug: 'study-corner',
    name: 'Study Corner',
    tagline: 'Smart study tools and desk essentials',
    description:
      'Focused on study productivity with practical supplies and desk optimization kits.',
    logoPlaceholder: 'SC',
    categoryFocus: 'Books & Notes',
    productCount: 36,
    isFeatured: false,
  },
];

export const FEATURED_STORES = STORES.filter((store) => store.isFeatured);

export const STORE_SPOTLIGHT = STORES.find(
  (store) => store.slug === 'techhub-diu'
);
