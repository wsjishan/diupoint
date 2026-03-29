# DIUPoint Project Context

Last updated: 2026-03-29

## 1) High-Level Overview

DIUPoint is a pnpm + Turbo monorepo for a student marketplace platform.

- Frontend: Next.js app (App Router) in apps/web
- Backend: NestJS API in apps/api
- Database: PostgreSQL via Prisma schema in packages/db
- Shared package(s):
  - packages/db exports Prisma client singleton utilities
  - packages/types currently contains minimal shared typing primitives

Primary feature domains:

- Authentication (email/password + Google OAuth)
- Listings and search
- Favorites and cart
- Checkout/orders
- Store profiles
- Verification workflow using OTP for DIU email domains

## 2) Monorepo Structure

Root workspace:

- package.json (workspace scripts)
- pnpm-workspace.yaml (apps/_ and packages/_)
- turbo.json (pipeline)
- prisma.config.ts (Prisma CLI config, points to packages/db/prisma/schema.prisma)

Apps:

- apps/api: NestJS backend
- apps/web: Next.js frontend

Packages:

- packages/db: Prisma schema, migrations, seed, db utilities
- packages/types: shared TypeScript types package (currently minimal)

## 3) Tooling and Runtime

- Package manager: pnpm 10
- Task runner: Turbo
- Language: TypeScript across apps/packages
- Node target indications:
  - API uses modern TS target (ES2022)
  - Web uses Next.js 16 + React 19

## 4) Root Scripts

From root package.json:

- dev: turbo run dev --parallel
- dev:web: turbo run dev --filter=web
- dev:api: turbo run dev --filter=api
- build: turbo run build
- lint: turbo run lint
- prisma:generate: pnpm --filter @diupoint/db prisma:generate

Turbo pipeline (turbo.json):

- dev is persistent and not cached
- build depends on upstream build and outputs .next/** and dist/**
- lint depends on upstream lint

## 5) Backend Context (apps/api)

### 5.1 Framework Setup

- NestJS v11 app with global /api prefix
- CORS enabled with origin: true and credentials: true
- Global ValidationPipe:
  - whitelist: true
  - transform: true
  - forbidUnknownValues: true
  - implicit conversion enabled

### 5.2 Environment Configuration

Validated env keys (required unless marked optional):

- DATABASE_URL (required)
- JWT_SECRET (required)
- PORT (default 4000)
- GOOGLE_CLIENT_ID (optional)
- GOOGLE_CLIENT_SECRET (optional)
- GOOGLE_CALLBACK_URL (optional)
- FRONTEND_URL (optional, defaults to http://localhost:3000)

Env file resolution order includes:

- apps/api/.env
- root .env
- dist-adjacent fallback

Security note:

- apps/api/.env currently contains real-looking credentials/secrets. Do not share raw values in external prompts or logs.

### 5.3 API Modules

Modules registered in AppModule:

- AuthModule
- UsersModule
- StoresModule
- ListingsModule
- SearchModule
- VerificationModule
- FavoritesModule
- CartModule
- OrdersModule

### 5.4 Auth Design

- JWT auth using Bearer token, secret from JWT_SECRET, expires in 7 days
- Password auth endpoints:
  - POST /api/auth/signup
  - POST /api/auth/signin
  - GET /api/auth/me (JWT required)
- Google OAuth flow:
  - GET /api/auth/google (entry)
  - GET /api/auth/google/start (guarded start)
  - GET /api/auth/google/callback (guarded callback)
- On successful auth, API returns:
  - accessToken
  - safe user payload with verification/account/store profile info

Password hashing behavior:

- Tries native bcrypt first
- Falls back to bcryptjs if native bindings are unavailable

### 5.5 Backend Route Surface (Controller-Level)

Auth:

- GET /api/auth/google
- GET /api/auth/google/start
- GET /api/auth/google/callback
- POST /api/auth/signup
- POST /api/auth/signin
- GET /api/auth/me

Users:

- GET /api/users/me/listings
- GET /api/users/me/listings/:id

Listings:

- GET /api/listings
- GET /api/listings/:slug
- POST /api/listings (JWT)
- PATCH /api/listings/:id (JWT)
- DELETE /api/listings/:id (JWT, archive)

Search:

- GET /api/search

Stores:

- GET /api/stores/me/dashboard (JWT)
- PATCH /api/stores/me (JWT)
- GET /api/stores/:slug

Favorites (JWT):

- GET /api/favorites
- POST /api/favorites/:listingId
- DELETE /api/favorites/:listingId

Cart (JWT):

- GET /api/cart
- POST /api/cart/items
- PATCH /api/cart/items/:id
- DELETE /api/cart/items/:id

Orders (JWT):

- POST /api/orders
- GET /api/orders/me
- GET /api/stores/me/orders

Verification (JWT):

- POST /api/verification/request
- POST /api/verification/confirm

### 5.6 Business Rules Worth Knowing

- DIU email domain logic appears in auth/verification workflows:
  - @diu.edu.bd
  - @s.diu.edu.bd
- OTP verification:
  - 6-digit code
  - expires after 10 minutes
  - returns mockOtp in non-production mode
- Service resilience:
  - auth service wraps several Prisma initialization/runtime failures into service-unavailable responses

## 6) Database Context (packages/db)

### 6.1 Prisma

- Provider: postgresql
- Prisma client generator: prisma-client-js
- Schema path: packages/db/prisma/schema.prisma

### 6.2 Core Models

- User
- StoreProfile
- Listing
- ListingImage
- Favorite
- VerificationRequest
- Cart
- CartItem
- Order
- OrderItem

### 6.3 Core Enums

- AccountType: PERSONAL | STORE
- VerificationStatus: UNVERIFIED | PENDING | VERIFIED
- SellerType: PERSONAL | STORE
- ListingCondition: NEW | LIKE_NEW | GOOD | FAIR | POOR
- ListingStatus: DRAFT | PUBLISHED | SOLD | ARCHIVED
- VerificationRequestStatus: PENDING | VERIFIED | EXPIRED | CANCELLED
- PaymentMethod: CASH_ON_DELIVERY | ONLINE_PAYMENT
- OrderStatus: PENDING | CONFIRMED | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED

### 6.4 DB Package Scripts

- build
- prisma:generate
- prisma:migrate:dev
- prisma:migrate:deploy
- prisma:seed

### 6.5 Seed Context

Seed script creates realistic sample data:

- store and personal users
- store profiles
- many listings + images
- verification requests
- cart/cart items
- orders/order items

Seed also uses bcrypt with bcryptjs fallback.

## 7) Frontend Context (apps/web)

### 7.1 Framework and Core Dependencies

- Next.js 16.1.6
- React 19.2.3
- TypeScript
- Tailwind CSS v4
- next-themes for theming

### 7.2 App Router Pages/Segments

Top-level app segments include:

- /
- /auth/callback
- /sign-in
- /sign-up
- /forgot-password
- /verify-account
- /search
- /listing/\*
- /store/\*
- /post-item
- /my-listings
- /favorites
- /cart
- /checkout
- /orders

### 7.3 Frontend Providers and State

Global providers in root layout:

- ThemeProvider
- AuthProvider
- CartProvider
- FavoritesProvider

Auth implementation:

- token stored in localStorage key: diupoint.auth.access-token
- auth context hydrates user by calling GET /auth/me
- sign-in/sign-up store token and hydrate user

### 7.4 API Client Layer

Core HTTP utility:

- default base URL: http://localhost:4000/api
- override via NEXT_PUBLIC_API_BASE_URL
- throws structured ApiRequestError on failure
- supports bearer token injection

API modules under src/lib/api map to backend features:

- auth.ts
- listings.ts
- search.ts
- stores.ts
- cart.ts
- favorites.ts
- orders.ts
- verification.ts

Fallback behavior:

- several read operations fall back to mock data when API calls fail
  - listings, listing detail, search, store detail

### 7.5 Data Mapping Notes

UI-facing listing condition is simplified:

- frontend type currently models condition as NEW or USED
- backend enum is richer (NEW, LIKE_NEW, GOOD, FAIR, POOR)
- adapter maps backend NEW => new and everything else => used

Checkout/payment naming mismatch to be aware of:

- frontend api types use COD/BKASH aliases
- backend Prisma payment enum is CASH_ON_DELIVERY/ONLINE_PAYMENT
- verify mapping in order creation path before relying on strict enum parity

## 8) Cross-Cutting Conventions and Caveats

- API base path is /api (backend sets global prefix)
- Web image allowlist includes images.unsplash.com
- Prisma client is exported as singleton from packages/db/src/index.ts
- Some backend services instantiate PrismaClient directly instead of reusing shared package singleton
- README at repo root is generic Next.js starter text and not representative of full monorepo setup

## 9) Quick Start Commands (Practical)

From repository root:

1. Install dependencies:
   - pnpm install
2. Generate Prisma client (if needed):
   - pnpm prisma:generate
3. Run API only:
   - pnpm dev:api
4. Run Web only:
   - pnpm dev:web
5. Run all dev targets:
   - pnpm dev

API default URL:

- http://localhost:4000/api

Web default URL:

- http://localhost:3000
