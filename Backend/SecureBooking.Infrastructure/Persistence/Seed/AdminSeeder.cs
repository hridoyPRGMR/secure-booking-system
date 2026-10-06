using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence.Seed;

/// <summary>
/// Creates an initial administrator from configuration (AdminSeed:Email / AdminSeed:Password).
/// Does nothing when either value is missing or a user with that email already exists.
/// </summary>
public static class AdminSeeder
{
    private static readonly Guid AdministratorRoleId = Guid.Parse("99999999-9999-9999-9999-999999999999");

    public static async Task SeedAsync(ApplicationDbContext dbContext, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["AdminSeed:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrEmpty(password))
        {
            return;
        }

        if (await dbContext.Users.AnyAsync(u => u.Email == email))
        {
            return;
        }

        var role = await dbContext.Roles.FirstOrDefaultAsync(r => r.Id == AdministratorRoleId);
        if (role is null)
        {
            logger.LogWarning("Administrator role not found; skipping admin seed.");
            return;
        }

        var user = new User(
            configuration["AdminSeed:FirstName"] ?? "Admin",
            configuration["AdminSeed:LastName"] ?? "User",
            email,
            BCrypt.Net.BCrypt.HashPassword(password));
        user.SetRoles([role]);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Seeded administrator account {Email}.", email);
    }
}
