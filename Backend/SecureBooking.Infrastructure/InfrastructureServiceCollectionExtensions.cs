using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Authentication;
using SecureBooking.Infrastructure.Authentication;
using SecureBooking.Infrastructure.Persistence;
using SecureBooking.Infrastructure.Persistence.Repositories;

namespace SecureBooking.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration
        )
    {
        services.Configure<JwtSettings>(
            configuration.GetSection(JwtSettings.SectionName));
            
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwtSettings = configuration
                    .GetSection(JwtSettings.SectionName)
                    .Get<JwtSettings>()!;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,

                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.Secret))
                };
            });
        
        services.AddScoped<IPasswordHasher,PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator,JwtTokenGenerator>();
        services.AddScoped<IRefreshTokenGenerator,RefreshTokenGenerator>();
        services.AddScoped<IRefreshTokenService,RefreshTokenService>();

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository,UserRepository>();
        services.AddScoped<IRefreshTokenRepository,RefreshTokenRepository>();

        services.AddScoped<IUnitOfWork>(sp=>
            sp.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }
}