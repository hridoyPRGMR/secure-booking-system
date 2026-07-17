using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Infrastructure.Authentication;
using SecureBooking.Infrastructure.Persistence;
using SecureBooking.Infrastructure.Persistence.Repositories;

namespace SecureBooking.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        
        services.AddScoped<IPasswordHasher,PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator,JwtTokenGenerator>();

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository,UserRepository>();

        services.AddScoped<IUnitOfWork>(sp=> 
            sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }
}