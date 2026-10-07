using System.Text.Json.Serialization;
using MediatR;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SecureBooking.Api.Infrastructure;
using SecureBooking.Application.Common;
using SecureBooking.Application.Features.Authentication;
using SecureBooking.Infrastructure;
using SecureBooking.Infrastructure.Persistence;
using SecureBooking.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddAuthorization();
builder.Services.AddHealthChecks();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();


const string CorsPolicy = "CorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>()!)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure DbContext (Postgres)
var connection = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connection));

var app = builder.Build();

// Development: the app applies migrations itself. Production: the deploy workflow does.
var migrateOnStartup = app.Environment.IsDevelopment();
var seedEnabled = app.Configuration.GetValue("SeedData:Enabled", app.Environment.IsDevelopment());

var adminSeedConfigured = !string.IsNullOrWhiteSpace(app.Configuration["AdminSeed:Email"]);

if (migrateOnStartup || seedEnabled || adminSeedConfigured)
{
    using var startupScope = app.Services.CreateScope();
    var dbContext = startupScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var seedLogger = startupScope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (migrateOnStartup)
    {
        var pending = (await dbContext.Database.GetPendingMigrationsAsync()).ToList();
        seedLogger.LogInformation(
            "Applying {Count} pending migration(s) on startup: {Migrations}",
            pending.Count, pending);
        await dbContext.Database.MigrateAsync();
    }

    if (adminSeedConfigured)
    {
        await AdminSeeder.SeedAsync(dbContext, app.Configuration, seedLogger);
    }

    if (seedEnabled)
    {
        await LargeDataSeeder.SeedAsync(dbContext, seedLogger);
    }
}

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

