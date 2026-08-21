---
name: secure-booking-frontend
description: Architecture, routing, state, API clients, types, and the hotel-first booking flow for the React public web app (Frontend/secure-booking-web) plus a note on the Angular admin panel. Use when editing frontend React/Vite/Tailwind/daisyUI code, adding pages/components, changing API calls, or the booking/search flow.
---

# Secure Booking System — Frontend

There are two frontends:

- **`Frontend/secure-booking-web`** — public booking app, **React 18 + Vite 5 + TypeScript (strict) + Tailwind CSS v4 + daisyUI 5**. This is the app these skills target.
- **`Frontend/admin-panel`** — Angular admin app (Angular CLI: `npm start` = `ng serve`). Separate; do not mix React conventions into it.

## secure-booking-web stack

- UI: **Tailwind CSS v4** via `@tailwindcss/vite`, styled with **daisyUI 5** components/classes.
- Data: **@tanstack/react-query** (query cache) + **axios**.
- Routing: **react-router-dom v6** (`createBrowserRouter`).
- Forms: **react-hook-form** + **zod** (`@hookform/resolvers`), **react-toastify** for toasts.
- Icons: `lucide-react`.

Run/verify (from `Frontend/secure-booking-web`):
```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # production build (vite build)
npx tsc --noEmit   # typecheck
```
`tsc` currently reports 3 pre-existing, unrelated errors (`src/components/profile/ProfileSettings.tsx` uses `.fullName`; `src/features/booking/index.ts` and `src/services/index.ts` import missing modules). Do not treat those as yours.

## src structure

```
pages/             route-level components (Home, Login, Signup, MyBookings, HotelDetails, Checkout)
components/        feature components: auth/ booking/ common/ hotel/ layout/ profile/
api/               apiClient.ts + per-domain clients (hotelApi, roomApi, bookingApi, locationApi)
hooks/             useAuth, useHotelListingFilters
lib/               tokenStore, hotelFilters
types/             Auth, Booking, Hotel, Location, Room, User
store/             placeholder (no global state)
context/           AuthContext
routes/ layouts/ features/   legacy/incidental
```

## Routing (`src/App.tsx`, createBrowserRouter)

`Layout` wraps the public site: `/` (Home), `/hotels` (browse), `/hotels/:id` (HotelDetails). `/rooms/*` redirects to `/hotels` (old room-first flow, removed). A `ProtectedRoute` outlet gates `/checkout`, `/bookings`, `/profile`. Standalone `/login`, `/signup`. Wildcard → `/`.

**Booking flow is hotel-first**: Hotels (search/filter/sort) → HotelDetails (`/hotels/:id` lists rooms) → pick a room → `/checkout?hotelId=..&roomId=..` (protected) → `BookingForm` → `bookingApi.createMyBooking` → `/bookings`.

## API & auth

- `src/api/apiClient.ts`: axios instance, `baseURL` = `VITE_API_BASE_URL` ?? `http://localhost:5212/api`, `withCredentials: true`. Request interceptor adds `Bearer` from `tokenStore`. Response interceptor handles 401 → refresh (queued) via `/auth/refresh-token`, then retries. Auth endpoints are excluded from refresh.
- Clients: `hotelApi` (`/public/hotels`, `/public/hotels/{id}`), `roomApi` (`/public/rooms`, `/public/rooms/{id}`), `bookingApi` (`/bookings/mine`), `locationApi` (`/public/locations`).
- `useAuth` (hooks/useAuth) wraps `AuthContext`; `lib/tokenStore` holds the access token (refresh token is an HttpOnly cookie).

## Types (`src/types`)

- `Hotel`: `id, name, description, starRating, reviewScore, propertyType, amenities[], imageUrl, isActive, locationId, locationCity, locationCountry, roomCount, minPricePerNight, createdAt`.
- `Room`, `Booking`, `User`, `Location`, `Auth`. `PropertyType`, `RoomType`, `BookingStatus` are enums serialized as strings.

## Hotel listing: search / filter / sort (URL-synced)

- **Filter state + URL sync**: `src/hooks/useHotelListingFilters.ts` reads initial state from the URL query params (`?q&city&country&checkIn&checkOut&adults&children&rooms&minPrice&maxPrice&stars&reviews&amenities&types&sort`) and writes them back (`replace`) as filters change. `q`, `minPrice`, `maxPrice` are **debounced 300ms** before they reach the API/URL.
- **Mappings**: `src/lib/hotelFilters.ts` holds constants (`AMENITY_OPTIONS`, `PROPERTY_TYPE_OPTIONS`, `REVIEW_LEVELS`, `SORT_OPTIONS`, price bounds), `parseUrlToFilters`, `filtersToApi`, `filtersToUrl`. Sort values: `recommended | price_asc | price_desc | rating` → API `sortBy`/`sortDescending` (`price`, `review`).
- **Components** (`src/components/hotel/`): `Hotels` (page: sticky sidebar on desktop, off-canvas daisyUI `drawer` on mobile, skeleton loader grid, keepPreviousData), `HotelSearchBar` (+ `LocationSearchInput` debounced autocomplete, `DateRangePicker`, `GuestsRoomsSelect` popover), `HotelFiltersSidebar` (+ `PriceRangeSlider`, `FilterGroup` checkbox group), `HotelSortSelect`, `HotelCard` (review score badge, min price, amenity chips).
- The API request is built with `filtersToApi(filters)` → `hotelApi.getHotels(...)`; results query keyed on that param object.

## Styling conventions

Use daisyUI 5 + Tailwind classes: `card`, `card-body`, `btn btn-primary`, `badge`, `input`, `select`, `checkbox`, `drawer`/`drawer-content`/`drawer-side`, `menu`, `fieldset`/`fieldset-legend`, `skeleton`, `loading`, `alert`, `toastify`. Keep components in the matching feature folder and reuse existing `types`.
