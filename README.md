# Shopping App (Expo + React Native)

## Overview
A mobile shopping application built with Expo Router and TypeScript. Users can browse products, search and filter, view details, manage a cart, and complete a mock checkout with an order confirmation. Cart state is persisted locally.

## Tech Stack (and why)
- Expo + React Native: fast iteration, device testing, and a clean baseline for production patterns.
- TypeScript: safer data models and predictable refactors.
- Expo Router: file-based routing with a clear stack + tabs structure.
- React Query: consistent server state, caching, and error handling for product data.
- Cart state via React Context + reducer: minimal dependencies, easy to reason about, works well with AsyncStorage persistence.
- AsyncStorage: persisted cart and order history (simple, non-sensitive local data).
- React Hook Form + Zod: ergonomic form state with schema-based validation.
- StyleSheet: consistent styling with centralized design tokens.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run start
   ```

## API Configuration
The base URL is centralized in `src/api/client.ts`.

- Default (works out of the box): `https://fakestoreapi.com`
- To use your own mock API (mockapi.io or similar), set an env variable:
  ```bash
  EXPO_PUBLIC_API_BASE_URL="https://your-mockapi.io/api/v1"
  ```

## Architecture Overview
- `app/`: Expo Router routes (tabs + stack)
- `src/api/`: REST client + endpoints
- `src/components/`: reusable UI elements
- `src/constants/`: theme tokens
- `src/features/`: domain modules (products, cart, orders)
- `src/context/`: cart context + reducer wiring
- `src/utils/`: helpers (currency, validation)
- `src/types/`: shared types

Flow summary:
1. Products fetched via React Query and rendered in `app/(tabs)/index.tsx`.
2. Cart state managed by context + reducer in `src/context` (with cart logic in `src/features/cart`) and persisted to AsyncStorage.
3. Checkout form validated with Zod; `submitOrder` is mocked locally and orders are stored in AsyncStorage for history.

## Screens
- Product Listing (search + category filter)
- Product Detail
- Cart
- Checkout
- Order Confirmation
- Orders History (local)
- Profile (placeholder)

## Screenshots
- `./screenshots/home.png`
- `./screenshots/detail.png`
- `./screenshots/cart.png`
- `./screenshots/checkout.png`
- `./screenshots/confirmation.png`

## Tradeoffs and Future Improvements
- Orders are stored locally to keep the assessment self-contained; in production, this would post to a real backend and fetch order history via React Query.
- Filtering is client-side for simplicity; server-side filtering would be preferable for large catalogs.
- Add product list skeleton placeholders for a more polished loading state.
- Add unit tests for cart reducer and checkout validation.

## Notes
- Cart persistence uses AsyncStorage because the data is not sensitive; SecureStore would be appropriate for sensitive data.
