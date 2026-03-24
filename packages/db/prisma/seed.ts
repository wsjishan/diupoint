import {
  AccountType,
  ListingCondition,
  ListingStatus,
  PaymentMethod,
  PrismaClient,
  SellerType,
  VerificationRequestStatus,
  VerificationStatus,
  OrderStatus,
} from '@prisma/client';

type BcryptLike = {
  hash: (data: string, saltOrRounds: number) => Promise<string>;
};

function loadHasher(): BcryptLike {
  try {
    // Prefer native bcrypt where available.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('bcrypt') as BcryptLike;
  } catch {
    // Fallback keeps local seed runnable when native bindings are missing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('bcryptjs') as BcryptLike;
  }
}

const hasher = loadHasher();

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Password123!';
const DIU_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];

type SeedUser = {
  fullName: string;
  email: string;
  accountType: AccountType;
  isActive?: boolean;
};

type StoreSeed = {
  ownerEmail: string;
  storeName: string;
  slug: string;
  description: string;
  phone: string;
  whatsapp: string;
  logoUrl: string;
  bannerUrl: string;
  isFeatured: boolean;
};

type ListingSeed = {
  ownerEmail: string;
  sellerType: SellerType;
  storeSlug?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  condition: ListingCondition;
  price: string;
  location: string;
  status: ListingStatus;
  images: string[];
};

function isDiuEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return DIU_DOMAINS.some((domain) => normalized.endsWith(domain));
}

async function clearTables() {
  await prisma.favorite.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.storeProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const passwordHash = await hasher.hash(TEST_PASSWORD, 12);
  const otpHash = await hasher.hash('123456', 10);

  await clearTables();

  const users: SeedUser[] = [
    {
      fullName: 'Campus Coffee Team',
      email: 'campus.coffee@diu.edu.bd',
      accountType: AccountType.STORE,
    },
    {
      fullName: 'Gadget Grove Team',
      email: 'gadget.grove@s.diu.edu.bd',
      accountType: AccountType.STORE,
    },
    {
      fullName: 'TechHub DIU Team',
      email: 'techhub@diu.edu.bd',
      accountType: AccountType.STORE,
    },
    {
      fullName: 'BookBarn DIU Team',
      email: 'hello@bookbarnbd.com',
      accountType: AccountType.STORE,
    },
    {
      fullName: 'Rakib Hasan',
      email: 'rakib@diu.edu.bd',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Nusrat Jahan',
      email: 'nusrat@s.diu.edu.bd',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Tahmid Karim',
      email: 'tahmid.karim@diu.edu.bd',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Afsana Mimi',
      email: 'afsanamimi@gmail.com',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Mahmud Rabby',
      email: 'mahmud.rabby@yahoo.com',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Shanta Akter',
      email: 'shanta.akter@outlook.com',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Rafi Rahman',
      email: 'rafi.rahman@diu.edu.bd',
      accountType: AccountType.PERSONAL,
    },
    {
      fullName: 'Sadia Noor',
      email: 'sadia.noor@mail.com',
      accountType: AccountType.PERSONAL,
    },
  ];

  const userByEmail = new Map<string, { id: string; email: string }>();

  for (const user of users) {
    const diu = isDiuEmail(user.email);
    const created = await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        passwordHash,
        accountType: user.accountType,
        verificationStatus: diu
          ? VerificationStatus.VERIFIED
          : VerificationStatus.UNVERIFIED,
        verifiedAt: diu ? new Date() : null,
        isActive: user.isActive ?? true,
      },
    });

    userByEmail.set(user.email, { id: created.id, email: created.email });
  }

  const stores: StoreSeed[] = [
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      storeName: 'Campus Coffee',
      slug: 'campus-coffee',
      description: 'Coffee, cold brew, and quick campus snacks near AB4.',
      phone: '+8801711000001',
      whatsapp: '+8801711000001',
      logoUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=80',
      isFeatured: true,
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      storeName: 'Gadget Grove',
      slug: 'gadget-grove',
      description: 'Phones, accessories, and student-friendly bundle deals.',
      phone: '+8801711000002',
      whatsapp: '+8801711000002',
      logoUrl:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80',
      isFeatured: true,
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      storeName: 'TechHub DIU',
      slug: 'techhub-diu',
      description:
        'Laptops, peripherals, and maintenance essentials for students.',
      phone: '+8801711000003',
      whatsapp: '+8801711000003',
      logoUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
      isFeatured: true,
    },
    {
      ownerEmail: 'hello@bookbarnbd.com',
      storeName: 'BookBarn DIU',
      slug: 'bookbarn-diu',
      description: 'Textbooks, novels, and affordable second-hand finds.',
      phone: '+8801711000004',
      whatsapp: '+8801711000004',
      logoUrl:
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80',
      isFeatured: false,
    },
  ];

  const storeBySlug = new Map<string, { id: string; ownerEmail: string }>();

  for (const store of stores) {
    const owner = userByEmail.get(store.ownerEmail);
    if (!owner) {
      throw new Error(`Missing owner user for store ${store.storeName}`);
    }

    const created = await prisma.storeProfile.create({
      data: {
        userId: owner.id,
        storeName: store.storeName,
        slug: store.slug,
        description: store.description,
        phone: store.phone,
        whatsapp: store.whatsapp,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        isFeatured: store.isFeatured,
      },
    });

    storeBySlug.set(store.slug, {
      id: created.id,
      ownerEmail: store.ownerEmail,
    });
  }

  const listings: ListingSeed[] = [
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'campus-coffee',
      title: 'Signature Cold Brew 500ml',
      slug: 'signature-cold-brew-500ml',
      description:
        'Slow-steeped coffee with a smooth finish. Perfect for long lab sessions.',
      category: 'Food & Beverage',
      condition: ListingCondition.NEW,
      price: '220.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'campus-coffee',
      title: 'Iced Latte Combo',
      slug: 'iced-latte-combo',
      description: 'Iced latte plus sandwich combo at student price.',
      category: 'Food & Beverage',
      condition: ListingCondition.NEW,
      price: '299.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'campus-coffee',
      title: 'Reusable Thermal Mug',
      slug: 'reusable-thermal-mug',
      description: '350ml insulated mug with Campus Coffee branding.',
      category: 'Accessories',
      condition: ListingCondition.NEW,
      price: '450.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'campus-coffee',
      title: 'Mocha Bottle Pack (x3)',
      slug: 'mocha-bottle-pack-x3',
      description: 'Three bottled mocha drinks for team project nights.',
      category: 'Food & Beverage',
      condition: ListingCondition.NEW,
      price: '540.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'campus.coffee@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'campus-coffee',
      title: 'Breakfast Croissant Pack',
      slug: 'breakfast-croissant-pack',
      description: 'Freshly baked croissants packed before 10AM.',
      category: 'Food & Beverage',
      condition: ListingCondition.NEW,
      price: '180.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'gadget-grove',
      title: 'USB-C 65W Fast Charger',
      slug: 'usb-c-65w-fast-charger',
      description: 'Compact GaN charger for laptop and phone.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '1450.00',
      location: 'DIU Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'gadget-grove',
      title: 'Wireless Mouse Silent Click',
      slug: 'wireless-mouse-silent-click',
      description: 'Ergonomic mouse with low-noise button clicks.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '980.00',
      location: 'DIU Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'gadget-grove',
      title: 'Noise Cancelling Earbuds',
      slug: 'noise-cancelling-earbuds',
      description:
        'ANC earbuds with long battery backup and clear call quality.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '2590.00',
      location: 'DIU Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'gadget-grove',
      title: 'Laptop Stand Aluminum',
      slug: 'laptop-stand-aluminum',
      description: 'Foldable aluminum stand suitable for 13-16 inch laptops.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '1350.00',
      location: 'DIU Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'gadget.grove@s.diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'gadget-grove',
      title: 'Mechanical Keyboard 87-Key',
      slug: 'mechanical-keyboard-87-key',
      description: 'Compact mechanical keyboard with hot-swappable switches.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '3490.00',
      location: 'DIU Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'techhub-diu',
      title: 'Dell Latitude i5 (Refurbished)',
      slug: 'dell-latitude-i5-refurbished',
      description: 'Reliable refurbished laptop with SSD upgrade.',
      category: 'Laptops',
      condition: ListingCondition.GOOD,
      price: '36500.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'techhub-diu',
      title: 'Asus TUF Gaming F15',
      slug: 'asus-tuf-gaming-f15',
      description: 'Gaming and 3D-ready laptop for power users.',
      category: 'Laptops',
      condition: ListingCondition.NEW,
      price: '98500.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'techhub-diu',
      title: 'Portable SSD 1TB',
      slug: 'portable-ssd-1tb',
      description: 'USB 3.2 portable SSD for project backups and media files.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '8900.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'techhub-diu',
      title: 'Dual Monitor Arm',
      slug: 'dual-monitor-arm',
      description: 'Ergonomic dual arm for desk productivity setup.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '4200.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'techhub@diu.edu.bd',
      sellerType: SellerType.STORE,
      storeSlug: 'techhub-diu',
      title: 'Graphics Drawing Tablet',
      slug: 'graphics-drawing-tablet',
      description: 'Pen tablet for design and animation coursework.',
      category: 'Electronics',
      condition: ListingCondition.NEW,
      price: '5100.00',
      location: 'DIU AB4, Dhanmondi',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1587614295999-6c1c1367516c?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'hello@bookbarnbd.com',
      sellerType: SellerType.STORE,
      storeSlug: 'bookbarn-diu',
      title: 'Data Structures in C (Used)',
      slug: 'data-structures-in-c-used',
      description: 'Clean used copy with highlighted key notes.',
      category: 'Books',
      condition: ListingCondition.GOOD,
      price: '320.00',
      location: 'DIU Library Gate',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'hello@bookbarnbd.com',
      sellerType: SellerType.STORE,
      storeSlug: 'bookbarn-diu',
      title: 'Discrete Mathematics Handbook',
      slug: 'discrete-mathematics-handbook',
      description: 'Concise reference book for quick revision.',
      category: 'Books',
      condition: ListingCondition.LIKE_NEW,
      price: '450.00',
      location: 'DIU Library Gate',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'hello@bookbarnbd.com',
      sellerType: SellerType.STORE,
      storeSlug: 'bookbarn-diu',
      title: 'Notebook Bundle (10 pcs)',
      slug: 'notebook-bundle-10-pcs',
      description: 'A4 ruled notebook bundle suitable for a full semester.',
      category: 'Stationery',
      condition: ListingCondition.NEW,
      price: '600.00',
      location: 'DIU Library Gate',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'hello@bookbarnbd.com',
      sellerType: SellerType.STORE,
      storeSlug: 'bookbarn-diu',
      title: 'Exam Board Marker Pack',
      slug: 'exam-board-marker-pack',
      description: 'Low-odor marker set for presentations and viva prep.',
      category: 'Stationery',
      condition: ListingCondition.NEW,
      price: '280.00',
      location: 'DIU Library Gate',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'rakib@diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'Used iPhone 12 128GB',
      slug: 'used-iphone-12-128gb',
      description: 'Battery health 87%, no major scratches, includes charger.',
      category: 'Electronics',
      condition: ListingCondition.GOOD,
      price: '33500.00',
      location: 'Dhanmondi 32',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'nusrat@s.diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'Calculator FX-991ES Plus',
      slug: 'calculator-fx-991es-plus',
      description: 'Original scientific calculator in great condition.',
      category: 'Stationery',
      condition: ListingCondition.LIKE_NEW,
      price: '1050.00',
      location: 'Shukrabad',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'tahmid.karim@diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'HP LaserJet M15w Printer',
      slug: 'hp-laserjet-m15w-printer',
      description: 'Compact printer, lightly used for assignment prints.',
      category: 'Electronics',
      condition: ListingCondition.GOOD,
      price: '7800.00',
      location: 'Mirpur 10',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1580894742597-87bc8789db3d?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'afsanamimi@gmail.com',
      sellerType: SellerType.PERSONAL,
      title: 'Women’s Bicycle 26-inch',
      slug: 'womens-bicycle-26-inch',
      description: 'Great for short commutes, recently serviced.',
      category: 'Lifestyle',
      condition: ListingCondition.FAIR,
      price: '6800.00',
      location: 'Mohammadpur',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'mahmud.rabby@yahoo.com',
      sellerType: SellerType.PERSONAL,
      title: 'Second-hand Study Table',
      slug: 'second-hand-study-table',
      description: 'Wooden study table with drawer, pickup only.',
      category: 'Furniture',
      condition: ListingCondition.FAIR,
      price: '2500.00',
      location: 'Lalmatia',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'rafi.rahman@diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'Arduino Starter Kit',
      slug: 'arduino-starter-kit',
      description: 'Includes UNO board, sensors, jumper cables, and case.',
      category: 'Electronics',
      condition: ListingCondition.LIKE_NEW,
      price: '1800.00',
      location: 'Dhanmondi 15',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'sadia.noor@mail.com',
      sellerType: SellerType.PERSONAL,
      title: 'Graphic Design Course Notes',
      slug: 'graphic-design-course-notes',
      description: 'Printed class notes and practice sheets for beginners.',
      category: 'Books',
      condition: ListingCondition.GOOD,
      price: '650.00',
      location: 'Shyamoli',
      status: ListingStatus.PUBLISHED,
      images: [
        'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'rakib@diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'Old DSLR Camera Body',
      slug: 'old-dslr-camera-body',
      description: 'Entry-level DSLR body, functional but heavily used.',
      category: 'Electronics',
      condition: ListingCondition.POOR,
      price: '7900.00',
      location: 'Dhanmondi 27',
      status: ListingStatus.SOLD,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      ownerEmail: 'nusrat@s.diu.edu.bd',
      sellerType: SellerType.PERSONAL,
      title: 'Dorm Mini Fridge',
      slug: 'dorm-mini-fridge',
      description: 'Small single-door fridge; ideal for hostel room.',
      category: 'Appliances',
      condition: ListingCondition.GOOD,
      price: '6200.00',
      location: 'Green Road',
      status: ListingStatus.ARCHIVED,
      images: [
        'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  ];

  const listingBySlug = new Map<
    string,
    { id: string; price: string; storeSlug?: string }
  >();

  for (const listing of listings) {
    const owner = userByEmail.get(listing.ownerEmail);
    if (!owner) {
      throw new Error(`Missing listing owner for ${listing.slug}`);
    }

    const store = listing.storeSlug
      ? storeBySlug.get(listing.storeSlug)
      : undefined;

    const created = await prisma.listing.create({
      data: {
        userId: owner.id,
        storeProfileId: store?.id,
        sellerType: listing.sellerType,
        title: listing.title,
        slug: listing.slug,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        price: listing.price,
        location: listing.location,
        status: listing.status,
      },
    });

    listingBySlug.set(listing.slug, {
      id: created.id,
      price: listing.price,
      storeSlug: listing.storeSlug,
    });

    await prisma.listingImage.createMany({
      data: listing.images.map((imageUrl, index) => ({
        listingId: created.id,
        imageUrl,
        sortOrder: index,
      })),
    });
  }

  const nonDiuUsers = users.filter((u) => !isDiuEmail(u.email));
  for (const [index, user] of nonDiuUsers.entries()) {
    const createdUser = userByEmail.get(user.email);
    if (!createdUser) continue;

    await prisma.verificationRequest.create({
      data: {
        userId: createdUser.id,
        verificationEmail: user.email,
        otpCodeHash: otpHash,
        expiresAt: new Date(
          Date.now() + (index % 2 === 0 ? 30 : -15) * 60 * 1000
        ),
        status:
          index % 2 === 0
            ? VerificationRequestStatus.PENDING
            : VerificationRequestStatus.EXPIRED,
      },
    });
  }

  const favoriteSeeds = [
    { userEmail: 'rakib@diu.edu.bd', listingSlug: 'noise-cancelling-earbuds' },
    { userEmail: 'rakib@diu.edu.bd', listingSlug: 'portable-ssd-1tb' },
    {
      userEmail: 'nusrat@s.diu.edu.bd',
      listingSlug: 'signature-cold-brew-500ml',
    },
    { userEmail: 'nusrat@s.diu.edu.bd', listingSlug: 'usb-c-65w-fast-charger' },
    {
      userEmail: 'tahmid.karim@diu.edu.bd',
      listingSlug: 'dell-latitude-i5-refurbished',
    },
    {
      userEmail: 'afsanamimi@gmail.com',
      listingSlug: 'data-structures-in-c-used',
    },
    {
      userEmail: 'mahmud.rabby@yahoo.com',
      listingSlug: 'reusable-thermal-mug',
    },
    {
      userEmail: 'sadia.noor@mail.com',
      listingSlug: 'graphics-drawing-tablet',
    },
    {
      userEmail: 'rafi.rahman@diu.edu.bd',
      listingSlug: 'mechanical-keyboard-87-key',
    },
  ];

  for (const seed of favoriteSeeds) {
    const user = userByEmail.get(seed.userEmail);
    const listing = listingBySlug.get(seed.listingSlug);
    if (!user || !listing) continue;

    await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId: listing.id,
      },
    });
  }

  const cartUsers = [
    'rakib@diu.edu.bd',
    'nusrat@s.diu.edu.bd',
    'afsanamimi@gmail.com',
    'mahmud.rabby@yahoo.com',
    'rafi.rahman@diu.edu.bd',
  ];

  const cartItemsByUser: Record<
    string,
    { listingSlug: string; quantity: number }[]
  > = {
    'rakib@diu.edu.bd': [
      { listingSlug: 'usb-c-65w-fast-charger', quantity: 1 },
      { listingSlug: 'signature-cold-brew-500ml', quantity: 2 },
    ],
    'nusrat@s.diu.edu.bd': [
      { listingSlug: 'wireless-mouse-silent-click', quantity: 1 },
      { listingSlug: 'notebook-bundle-10-pcs', quantity: 1 },
    ],
    'afsanamimi@gmail.com': [
      { listingSlug: 'data-structures-in-c-used', quantity: 1 },
      { listingSlug: 'mocha-bottle-pack-x3', quantity: 1 },
    ],
    'mahmud.rabby@yahoo.com': [
      { listingSlug: 'portable-ssd-1tb', quantity: 1 },
    ],
    'rafi.rahman@diu.edu.bd': [
      { listingSlug: 'exam-board-marker-pack', quantity: 3 },
    ],
  };

  for (const email of cartUsers) {
    const user = userByEmail.get(email);
    if (!user) continue;

    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    const cartItems = cartItemsByUser[email] ?? [];
    for (const cartItem of cartItems) {
      const listing = listingBySlug.get(cartItem.listingSlug);
      if (!listing) continue;

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          listingId: listing.id,
          quantity: cartItem.quantity,
          unitPrice: listing.price,
        },
      });
    }
  }

  const orderSeeds = [
    {
      userEmail: 'rakib@diu.edu.bd',
      storeSlug: 'gadget-grove',
      paymentMethod: PaymentMethod.ONLINE_PAYMENT,
      status: OrderStatus.DELIVERED,
      items: [
        { listingSlug: 'usb-c-65w-fast-charger', quantity: 1 },
        { listingSlug: 'wireless-mouse-silent-click', quantity: 1 },
      ],
    },
    {
      userEmail: 'nusrat@s.diu.edu.bd',
      storeSlug: 'campus-coffee',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      status: OrderStatus.CONFIRMED,
      items: [{ listingSlug: 'iced-latte-combo', quantity: 2 }],
    },
    {
      userEmail: 'afsanamimi@gmail.com',
      storeSlug: 'bookbarn-diu',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      status: OrderStatus.PENDING,
      items: [
        { listingSlug: 'discrete-mathematics-handbook', quantity: 1 },
        { listingSlug: 'notebook-bundle-10-pcs', quantity: 1 },
      ],
    },
    {
      userEmail: 'rafi.rahman@diu.edu.bd',
      storeSlug: 'techhub-diu',
      paymentMethod: PaymentMethod.ONLINE_PAYMENT,
      status: OrderStatus.SHIPPED,
      items: [{ listingSlug: 'portable-ssd-1tb', quantity: 1 }],
    },
  ];

  for (const orderSeed of orderSeeds) {
    const user = userByEmail.get(orderSeed.userEmail);
    const store = storeBySlug.get(orderSeed.storeSlug);
    if (!user || !store) continue;

    let subtotal = 0;
    for (const item of orderSeed.items) {
      const listing = listingBySlug.get(item.listingSlug);
      if (!listing) continue;
      subtotal += Number(listing.price) * item.quantity;
    }

    const total = subtotal;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        storeProfileId: store.id,
        paymentMethod: orderSeed.paymentMethod,
        status: orderSeed.status,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
      },
    });

    for (const item of orderSeed.items) {
      const listing = listingBySlug.get(item.listingSlug);
      if (!listing) continue;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          listingId: listing.id,
          quantity: item.quantity,
          unitPrice: listing.price,
        },
      });
    }
  }

  console.log('Seed complete: DIUPoint development data is ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
