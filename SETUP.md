# Setup and initial run

Backend (.NET 10 + Postgres):

- Ensure .NET 10 SDK is installed.
- Start Postgres (local or via Docker). Example Docker command:

```sh
docker run --name sb-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=securebooking -p 5432:5432 -d postgres:15
```

- From the `Backend` folder, restore and build:

```sh
dotnet restore
dotnet build
```

- To create the initial EF Core migration and apply it (Infrastructure project contains the DbContext):

```sh
dotnet tool install --global dotnet-ef --version 8.0.10
dotnet ef migrations add InitialCreate -p Backend/SecureBooking.Infrastructure -s Backend/SecureBooking.Api -o Migrations
dotnet ef database update -p Backend/SecureBooking.Infrastructure -s Backend/SecureBooking.Api
```

Frontend (Vite + React + TypeScript):

- From `Frontend/secure-booking-web` run:

```sh
npm install
npm run dev
```

Notes:
- The API uses the connection string in `Backend/SecureBooking.Api/appsettings.json`.
- After this initial scaffold, implement features, authentication, and CI/CD as needed.
