using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SecureBooking.Infrastructure.Persistence.Repositories;

public class UserRepository(ApplicationDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u=> u.Email == email, cancellationToken);
    }
}
