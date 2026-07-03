# Development Guide

This guide explains how to set up, run, and develop the Secure Booking System locally.

---

## Prerequisites

### Backend
- **.NET 10 SDK** — [Download .NET 10](https://dotnet.microsoft.com/download)
- **PostgreSQL 15+** — [Download PostgreSQL](https://www.postgresql.org/download/)

### Frontend
- **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- **npm 9+** (comes with Node.js)

---

## Quick Start

### 1. Clone & Open Project

```bash
# Navigate to project root
cd secure-booking-system
```

### 2. Backend Setup

#### 2.1 Configure Database Connection

Edit `Backend/SecureBooking.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=secure_booking_db;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password.**

#### 2.2 Create the Database

```bash
# Navigate to Backend folder
cd Backend

# Run initial migration to create database schema
dotnet ef database update --project SecureBooking.Infrastructure --startup-project SecureBooking.Api
```

#### 2.3 Run Backend

```bash
# From Backend folder
dotnet run --project SecureBooking.Api

# OR from project root
dotnet run --project Backend/SecureBooking.Api/SecureBooking.Api.csproj
```

Backend runs on `https://localhost:5001` and `http://localhost:5000`

API documentation available at `https://localhost:5001/openapi/v1.json`

### 3. Frontend Setup

```bash
# Navigate to Frontend folder
cd Frontend/secure-booking-web

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Database Migrations

Code-First migrations are managed via Entity Framework Core.

### Create a New Migration

```bash
cd Backend

# Create new migration after modifying DbContext or entities
dotnet ef migrations add MigrationName \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api

# Example:
dotnet ef migrations add AddBookingStatusColumn \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api
```

**Migrations are stored in:** `Backend/SecureBooking.Infrastructure/Persistence/Migrations/`

### Apply Migrations to Database

```bash
cd Backend

# Update database to latest migration
dotnet ef database update \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api

# Update to specific migration
dotnet ef database update MigrationName \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api

# Revert last migration
dotnet ef database update PreviousMigrationName \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api
```

### View Migration History

```bash
cd Backend

# List all migrations
dotnet ef migrations list \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api
```

### Remove/Undo Migrations (Before Committing)

```bash
cd Backend

# Remove last migration (only if not yet applied to database)
dotnet ef migrations remove \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api
```

---

## Building & Testing

### Build Backend

```bash
cd Backend

# Restore packages and build
dotnet build Backend.slnx

# Or build specific project
dotnet build Backend/SecureBooking.Api/SecureBooking.Api.csproj
```

### Build Frontend

```bash
cd Frontend/secure-booking-web

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Run Tests

```bash
# Backend unit tests (when available)
cd Backend
dotnet test

# Frontend unit tests (when available)
cd Frontend/secure-booking-web
npm test
```

---

## Project Structure

### Backend

```
Backend/
├── SecureBooking.Api/              # ASP.NET Core API entry point
│   ├── Program.cs                  # Service configuration & middleware
│   ├── Controllers/                # API endpoints
│   ├── appsettings.json            # Production config
│   ├── appsettings.Development.json # Local development config
│   └── SecureBooking.Api.csproj
│
├── SecureBooking.Application/      # CQRS application layer
│   ├── Behaviors/                  # Pipeline behaviors (validation, logging, perf)
│   ├── Features/                   # Commands, queries, handlers by feature
│   ├── Common/                     # DI extensions, shared utilities
│   └── SecureBooking.Application.csproj
│
├── SecureBooking.Domain/           # Core business logic
│   ├── Entities/                   # Domain models (User, Room, Booking, etc.)
│   └── SecureBooking.Domain.csproj
│
├── SecureBooking.Infrastructure/   # Data access & external services
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs # EF Core DbContext
│   │   └── Migrations/             # EF Core migrations
│   └── SecureBooking.Infrastructure.csproj
│
└── Back.slnx                       # Solution file
```

### Frontend

```
Frontend/secure-booking-web/
├── src/
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   ├── components/                 # Reusable UI components
│   ├── pages/                      # Page components
│   ├── hooks/                      # Custom React hooks
│   ├── services/                   # API service clients
│   ├── types/                      # TypeScript types
│   ├── styles/                     # Global styles & Tailwind CSS
│   └── index.css                   # Tailwind directives
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite build config
├── tsconfig.json                   # TypeScript config
└── index.html                      # HTML entry point
```

---

## CQRS Architecture

The application follows the **Command Query Responsibility Segregation (CQRS)** pattern:

### Adding a New Feature (Example: CreateBooking)

#### 1. Create Domain Entity

`Backend/SecureBooking.Domain/Entities/Booking.cs`

```csharp
public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public BookingStatus Status { get; set; }
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled
}
```

#### 2. Create Command & Handler

`Backend/SecureBooking.Application/Features/Booking/Commands/CreateBookingCommand.cs`

```csharp
using MediatR;

namespace SecureBooking.Application.Features.Booking.Commands;

public class CreateBookingCommand : IRequest<CreateBookingResponse>
{
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
}

public class CreateBookingResponse
{
    public int BookingId { get; set; }
    public BookingStatus Status { get; set; }
}
```

`Backend/SecureBooking.Application/Features/Booking/Commands/CreateBookingCommandHandler.cs`

```csharp
using MediatR;

namespace SecureBooking.Application.Features.Booking.Commands;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, CreateBookingResponse>
{
    private readonly ApplicationDbContext _context;

    public CreateBookingCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateBookingResponse> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken)
    {
        var booking = new Booking
        {
            UserId = request.UserId,
            RoomId = request.RoomId,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            Status = BookingStatus.Pending
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateBookingResponse
        {
            BookingId = booking.Id,
            Status = booking.Status
        };
    }
}
```

#### 3. Create Validator

`Backend/SecureBooking.Application/Features/Booking/Validators/CreateBookingCommandValidator.cs`

```csharp
using FluentValidation;

namespace SecureBooking.Application.Features.Booking.Validators;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.UserId)
            .GreaterThan(0)
            .WithMessage("User ID must be greater than 0");

        RuleFor(x => x.RoomId)
            .GreaterThan(0)
            .WithMessage("Room ID must be greater than 0");

        RuleFor(x => x.CheckOutDate)
            .GreaterThan(x => x.CheckInDate)
            .WithMessage("Check-out date must be after check-in date");
    }
}
```

#### 4. Register Handler (Already Automatic via DI)

The DI extension `AddApplicationServices()` in `Program.cs` automatically registers all handlers.

#### 5. Create API Controller

`Backend/SecureBooking.Api/Controllers/BookingsController.cs`

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace SecureBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);
        return Ok(response);
    }
}
```

---

## Pipeline Behaviors

All commands/queries automatically flow through these behaviors:

1. **ValidationBehavior** — Validates request using FluentValidation
2. **LoggingBehavior** — Logs request/response and exceptions
3. **PerformanceBehavior** — Logs slow-running requests (>500ms)

---

## Common Commands

### Restore NuGet Packages

```bash
dotnet restore Backend.slnx
```

### Clean Build Artifacts

```bash
dotnet clean Backend.slnx
```

### Format Code

```bash
# Format C# files
dotnet format Backend.slnx

# Format TypeScript/JavaScript
cd Frontend/secure-booking-web
npm run format
```

### Run Backend in Release Mode

```bash
cd Backend
dotnet run --project SecureBooking.Api --configuration Release
```

---

## Troubleshooting

### Backend Won't Start

**Issue:** `System.InvalidOperationException: Unable to connect to database`

**Solution:**
1. Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
2. Check connection string in `appsettings.Development.json`
3. Verify database exists: `SELECT datname FROM pg_database;` (in psql)
4. Recreate database: 
   ```bash
   cd Backend
   dotnet ef database drop --project Infrastructure --startup-project Api
   dotnet ef database update --project Infrastructure --startup-project Api
   ```

### Frontend Can't Connect to Backend

**Issue:** CORS error in browser console

**Solution:**
1. Verify backend is running (`https://localhost:5001`)
2. Check CORS configuration in `Backend/SecureBooking.Api/Program.cs`
3. Add origin if needed:
   ```csharp
   services.AddCors(opt => opt.AddPolicy("AllowFrontend", builder =>
       builder.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader()
   ));
   ```

### npm install Fails

**Issue:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Use legacy peer dependencies
npm install --legacy-peer-deps

# Or clean cache and retry
npm cache clean --force
npm install
```

### Migration Add Fails

**Issue:** `The type or namespace name 'ApplicationDbContext' could not be found`

**Solution:**
```bash
cd Backend

# Ensure you're in the Backend folder and using correct project paths
dotnet ef migrations add MigrationName \
  --project SecureBooking.Infrastructure \
  --startup-project SecureBooking.Api \
  --context ApplicationDbContext
```

---

## Environment Variables (Optional)

Create `.env` file in `Backend/SecureBooking.Api/` for sensitive configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secure_booking_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## Next Steps

1. ✅ Backend runs successfully
2. ✅ Frontend runs successfully
3. 📖 Read [ProjectGuide.md](ProjectGuide.md) for architecture overview
4. 🛠️ Start implementing features using CQRS pattern
5. 🧪 Add unit and integration tests
6. 🐳 Set up Docker configuration for deployment

---

For questions or issues, refer to the error logs or contact the development team.
