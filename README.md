# Secure Booking System

Secure, production-ready hotel booking platform: ASP.NET Core backend, Angular admin panel, and public booking web app.

## Structure

```
Backend/
  SecureBooking.Api             API host (controllers, DI, Program.cs)
  SecureBooking.Application     Use cases (CQRS via MediatR)
  SecureBooking.Domain           Entities (User, Hotel, Room, Booking, Role, Permission, ...)
  SecureBooking.Infrastructure   EF Core, auth, repositories, migrations
  SecureBooking.Shared           Enums / cross-cutting types
Frontend/
  admin-panel                   Angular admin app
  secure-booking-web            Angular public booking app
tests/
  UnitTests / IntegrationTests / SecurityTests
```

## Backend Setup

1. Update `ConnectionStrings:DefaultConnection` in `Backend/SecureBooking.Api/appsettings.json` (PostgreSQL).
2. Run migrations and start the API:
   ```
   cd Backend/SecureBooking.Api
   dotnet run
   ```
3. API docs (dev only): `/scalar/v1`

### Default admin

Seeded via migration: `admin@gmail.com` / `Admin123!` — change after first login.

### Auth

JWT bearer + refresh tokens, role/permission-based authorization (`Roles`, `Permissions`, `RolePermissions`, `UserRoles`).

## Example Data Seeder

`SecureBooking.Infrastructure/Persistence/Seed/LargeDataSeeder.cs` generates ~150k example rows (100k users, 50 locations, 200 hotels, 2k rooms, 50k bookings) for local testing.

- Controlled by `SeedData:Enabled` (appsettings).
- **On** by default in `appsettings.Development.json`, **off** in `appsettings.json`.
- Idempotent — skips if `Users` count already ≥ 100,000.
- Runs automatically on app startup via `Program.cs` (migrates DB, then seeds).
- Seeded users: `user1@example.com` … `user100000@example.com`, password `Password123!`.

## Frontend Setup

```
cd Frontend/admin-panel        # or Frontend/secure-booking-web
npm install
npm start
```

## Tests

```
dotnet test
```
