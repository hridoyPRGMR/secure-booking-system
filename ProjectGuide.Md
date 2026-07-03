# Repository

```
secure-booking-system
```

---

# Tech Stack

## Backend

```
ASP.NET Core 10
C#
PostgreSQL
Redis
MediatR
FluentValidation
EF Core
JWT
Serilog
OpenTelemetry
Docker
xUnit
```

## Frontend

```
React
TypeScript
Vite
React Router
TanStack Query
React Hook Form
Zod
Axios
TailwindCSS
```

---

# Solution Structure

```
SecureBookingSystem

src
│
├── Backend
│
│   ├── SecureBooking.Api
│   │
│   ├── SecureBooking.Application
│   │
│   ├── SecureBooking.Domain
│   │
│   ├── SecureBooking.Infrastructure
│   │
│   └── SecureBooking.Shared
│
├── Frontend
│
│   └── secure-booking-web
│
tests
│
├── UnitTests
│
├── IntegrationTests
│
└── SecurityTests
│
docs

docker

.github
```

---

# Backend

```
SecureBooking.Api

Controllers/

Middleware/

Filters/

Extensions/

Authentication/

Authorization/

ProblemDetails/

Swagger/

Program.cs
```

---

# Application

```
Application

Abstractions/

Behaviors/

Commands/

Queries/

Validators/

Mappings/

Events/

Features/

DTOs/

Interfaces/
```

Inside Features

```
Authentication

Booking

Room

User

Admin
```

Example

```
Features

Booking

Commands

CreateBooking

CancelBooking

Queries

GetBooking

GetBookings

Validators

Events
```

---

# CQRS Pipeline

```
Request

↓

ValidationBehavior

↓

LoggingBehavior

↓

PerformanceBehavior

↓

AuthorizationBehavior

↓

Handler

↓

Result
```

Later we can add

```
CachingBehavior

RetryBehavior

IdempotencyBehavior
```

---

# Domain

```
Domain

Entities/

ValueObjects/

Enums/

Events/

Exceptions/

Specifications/

Repositories/

Services/

Policies/
```

Entities

```
User

Booking

Room
```

---

# Infrastructure

```
Infrastructure

Persistence/

Repositories/

Configurations/

Authentication/

Authorization/

Redis/

Caching/

Email/

FileStorage/

Identity/

BackgroundJobs/

Services/

Security/

Logging/
```

---

# Security Folder

```
Security

JwtService

RefreshTokenService

PasswordHasher

RateLimiter

SecurityHeaders

ContentSecurityPolicy

Encryption

AuditLogger

IpAddressProvider
```

---

# Frontend

```
src

api/

auth/

components/

features/

hooks/

layouts/

lib/

pages/

providers/

routes/

schemas/

services/

store/

types/

utils/
```

Features

```
authentication

booking

room

profile
```

---

# API Folder

```
api

authApi.ts

bookingApi.ts

roomApi.ts

userApi.ts
```

---

# Docs

This is where I want you to shine.

```
docs

architecture

security

deployment

performance

api

decision-records
```

---

## Architecture

```
overview.md

clean-architecture.md

cqrs.md

folder-structure.md

request-pipeline.md
```

---

## Security

```
authentication.md

authorization.md

jwt.md

refresh-token.md

password-hashing.md

rate-limiting.md

security-headers.md

cors.md

csrf.md

xss.md

sql-injection.md

clickjacking.md

audit-logging.md

file-upload.md
```

---

## ADR

Architecture Decision Records

```
0001-clean-architecture.md

0002-cqrs.md

0003-why-jwt.md

0004-why-refresh-token.md

0005-why-redis.md

0006-why-postgresql.md
```

This is something many junior portfolios don't include, and it demonstrates engineering decision-making.

---

# Security Features Checklist

## Authentication

* ✅ Register
* ✅ Login
* ✅ Logout
* ✅ Refresh Token Rotation
* ✅ Password Reset
* ✅ Email Verification
* ✅ Account Lockout
* ✅ Remember Me

---

## Authorization

* ✅ JWT
* ✅ Roles
* ✅ Permissions
* ✅ Policy Authorization
* ✅ Resource Authorization

---

## API Security

* ✅ Global Exception Handler
* ✅ Problem Details
* ✅ Validation
* ✅ Rate Limiting
* ✅ Request Size Limit
* ✅ Idempotency
* ✅ API Versioning

---

## Web Security

* ✅ CSP
* ✅ HSTS
* ✅ X-Frame-Options
* ✅ X-Content-Type-Options
* ✅ Referrer Policy
* ✅ Permissions Policy
* ✅ CORS

---

## Data Security

* ✅ Password Hashing
* ✅ Sensitive Data Masking
* ✅ Parameterized Queries
* ✅ Encryption Service

---

## Monitoring

* ✅ Audit Log
* ✅ Structured Logging
* ✅ Correlation ID
* ✅ Request ID
* ✅ Health Checks
* ✅ OpenTelemetry

---

## Testing

* ✅ Unit Tests
* ✅ Integration Tests
* ✅ Authorization Tests
* ✅ Security Tests

---

# GitHub Project Board

Instead of building randomly, create milestones:

```
Milestone 1
Project Setup

Milestone 2
Authentication

Milestone 3
Authorization

Milestone 4
Booking Module

Milestone 5
CQRS

Milestone 6
Redis

Milestone 7
Rate Limiting

Milestone 8
Security Headers

Milestone 9
Audit Logging

Milestone 10
Testing

Milestone 11
Observability

Milestone 12
Documentation
```

---

# My biggest recommendation

One thing I'd change from a typical tutorial project is **how you commit**.

Don't make commits like:

```
Fixed bugs

Updated code

Changes
```

Instead, commit as if you're working on a real team:

```
feat(auth): implement JWT authentication

feat(auth): add refresh token rotation

feat(booking): prevent overlapping bookings

feat(rate-limit): add sliding window limiter

feat(logging): introduce Serilog request logging

feat(security): configure Content Security Policy

feat(cqrs): add MediatR pipeline behaviors

test(auth): cover login and refresh token scenarios

docs(security): explain XSS mitigation strategy
```
