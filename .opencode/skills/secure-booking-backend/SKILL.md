---
name: secure-booking-backend
description: Architecture, conventions, entities, API surface, and build/migrate commands for the ASP.NET Core backend of the secure-booking-system. Use when editing backend code, adding endpoints/features/entities, running migrations, or debugging .NET/EF/DTO/controller issues in Backend/.
---

# Secure Booking System — Backend

ASP.NET Core **.NET 10** backend under `Backend/`. Solution: `Backend/Backend.slnx`.

## Project layout (Clean Architecture, ports-and-adapters)

| Project               | Responsibility                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| `SecureBooking.Api`   | Web host: controllers, DI, `Program.cs`, middleware, CORS, JSON options         |
| `SecureBooking.Application` | Use cases, CQRS via **MediatR**, DTOs, validators, common abstractions     |
| `SecureBooking.Domain` | Entities + domain model (no dependencies)                                      |
| `SecureBooking.Infrastructure` | EF Core, Postgres, repositories, JWT/RBAC auth, `Persistence/` (DbContext, migrations, seed) |
| `SecureBooking.Shared` | Cross-cutting enums (`RoomType`, `PropertyType`, `BookingStatus`)               |

## Core patterns

- **CQRS via MediatR.** Each use case is a `record` implementing `IRequest<T>` in `Application/Features/<Feature>/Commands|Queries/`, paired with a handler. DTOs live in the same feature folder (e.g. `Features/Hotels/DTOs/HotelResponse.cs`). Features: `Hotels`, `Rooms`, `Bookings`, `Locations`, `Authentication`.
- **EF Core 10 + Npgsql (PostgreSQL).** `ApplicationDbContext` implements `IUnitOfWork` (Begin/Commit/Rollback) and `IApplicationDbContext` (DbSets). Query handlers inject `IApplicationDbContext` and use `.AsNoTracking()`; command handlers use `IRepository<T>` + `IUnitOfWork`. Specialized repos exist (`UserRepository`, `RefreshTokenRepository`, `RoomRepository`).
- **Auth:** JWT bearer + HttpOnly refresh-token cookie. RBAC via `Role`/`Permission` + `PermissionPolicyProvider`. Protected endpoints use `[Authorize]`/permission requirements. Public catalog is `[AllowAnonymous]`.
- **Exceptions:** global handler (`GlobalExceptionHandler`) + `ProblemDetails` (`app.AddExceptionHandler`, `AddProblemDetails`).
- **JSON:** camelCase + `JsonStringEnumConverter` → enums serialize/deserialize as **strings**.

## Entities (`SecureBooking.Domain/Entities`, all extend `Entity`)

`Entity` base = `Guid Id`, `DateTime CreatedAt`, `DateTime UpdatedAt`.

- **User** — Email (unique), FirstName, LastName, PasswordHash, Roles.
- **Hotel** — Name, Description, StarRating (1-5), `ReviewScore` (double 0-10), `PropertyType` (enum), `Amenities` (`ICollection<string>`, stored as Postgres `text[]`), ImageUrl, IsActive, LocationId, Location, Rooms. `roomCount` and `minPricePerNight` are **computed in the response DTO** (cheapest active room), not stored.
- **Room** — Name, `Type` (RoomType), Description, Capacity, PricePerNight (decimal 10,2), ImageUrl, IsActive, `Version` (concurrency token), HotelId, Hotel, Bookings.
- **Booking** — UserId, RoomId, CheckIn, CheckOut, Status (BookingStatus), Notes, TotalPrice. Unique index `(RoomId, CheckIn, CheckOut)`.
- **Location** — City, Country, Address, Latitude, Longitude. GIN trigram index on (City, Country, Address); `pg_trgm` extension enabled.
- **RefreshToken**, **Role**, **Permission**.

Enums (`SecureBooking.Shared/Enums`):
- `RoomType`: Standard, Deluxe, Suite, Family.
- `PropertyType`: Hotel, Resort, Villa, Apartment.
- `BookingStatus`: Pending, Confirmed, CheckedIn, CheckedOut, Cancelled.

## Public API (`PublicController`, route `api/public`, `[AllowAnonymous]`)

- `GET /api/public/hotels` — paged. Params: `page, pageSize, search, sortBy, sortDescending, city, country, minPrice, maxPrice, starRatings (csv "3,4,5"), reviewScoreMin, amenities (csv, AND), propertyTypes (csv)`. `sortBy`: `starrating | review | price | createdat` (default name). Always forces `IsActive=true`. Returns `PagedResult<HotelResponse>`.
- `GET /api/public/hotels/{id:guid}` — `HotelResponse`.
- `GET /api/public/rooms` — paged. Params: `page, pageSize, search, sortBy (pricepernight|capacity|createdat), sortDescending, hotelId, type, checkIn, checkOut, city, country`. Forces `IsActive=true`; when `checkIn`+`checkOut` set, excludes rooms with overlapping non-cancelled bookings. Returns `PagedResult<RoomResponse>`.
- `GET /api/public/rooms/{id:guid}` — `RoomResponse`.
- `GET /api/public/locations?search=` — returns `[{ city, country, displayText }]`.

Other endpoints: `/auth/login`, `/auth/register`, `/auth/refresh-token` (Authentication); `/bookings/mine` (GET/POST) and `/bookings/mine/{id}/cancel` (protected).

### DTO shapes
- `HotelResponse`: `id, name, description, starRating, reviewScore, propertyType, amenities[], imageUrl, isActive, locationId, locationCity, locationCountry, roomCount, minPricePerNight, createdAt`.
- `RoomResponse`: `id, name, type, description, capacity, pricePerNight, imageUrl, isActive, hotelId, hotelName, bookingCount, createdAt`.
- `PagedResult<T>`: `{ items, page, pageSize, totalCount, totalPages }`.

## Data / seeding

- Postgres connection: `ConnectionStrings:DefaultConnection` in `Backend/SecureBooking.Api/appsettings*.json`.
- Migrations in `SecureBooking.Infrastructure/Persistence/Migrations`; **applied automatically at startup** via `Program.cs` (`dbContext.Database.MigrateAsync()` when `SeedData:Enabled`).
- `SeedData:Enabled` = **true** in `appsettings.Development.json`, **false** in `appsettings.json`.
- `LargeDataSeeder` (Infrastructure/Persistence/Seed): 100k users, 300 locations, 1,500 hotels, 15k rooms, 400k bookings. Idempotent — skips if `Users >= 100_000`. Seeded hotels get `PropertyType`, `ReviewScore`, and a random `Amenities` subset. Dev `password` for `user1@…` = `Password123!`.

## Commands

```bash
cd Backend
dotnet build                                              # full solution
dotnet run --project SecureBooking.Api --urls http://localhost:5212   # http profile (5212)

# Migrations (run from Backend/)
dotnet ef migrations add <Name> --project SecureBooking.Infrastructure --startup-project SecureBooking.Api --output-dir Persistence/Migrations
dotnet ef database update --project SecureBooking.Infrastructure --startup-project SecureBooking.Api

dotnet test                                               # tests in ./UnitTests, ./IntegrationTests, ./SecurityTests
```

- API runs on `http://localhost:5212` (`launchSettings` http profile); Scalar docs exposed in dev at `/scalar/v1`.
- CORS allowed origins (`appsettings.json` → `Cors:AllowedOrigins`): `http://localhost:5173`, `https://localhost:4300`, `http://localhost:4200`.

## Gotchas

- The frontend `secure-booking-web` (React) expects the API shape above; if you change a DTO, update `Frontend/secure-booking-web/src/types/*` AND both the list and get-by-id handlers (they duplicate the projection).
- Azure-locality: keep `DateTime` UTC (a global value converter enforces it).
- Enum columns are stored as int; `Amenities` is Postgres `text[]` — filter with `h.Amenities.Contains(x)` (translates to `= ANY`).
