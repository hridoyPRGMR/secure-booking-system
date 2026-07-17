using MediatR;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SecureBooking.Api.Infrastructure;
using SecureBooking.Application.Common;
using SecureBooking.Application.Features.Authentication;
using SecureBooking.Infrastructure;
using SecureBooking.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();


// Configure DbContext (Postgres)
var connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connection));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

var app = builder.Build();

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

