using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository(ApplicationDbContext context)
    : Repository<RefreshToken>(context), IRefreshTokenRepository
{
    // AddAsync(RefreshToken, CancellationToken) is already satisfied by the base Repository<T> implementation.

    public async Task<RefreshToken?> GetByHashAsync(string hash, CancellationToken cancellationToken)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
    }

    public async Task RevokeAllForUserAsync(Guid id, CancellationToken cancellationToken)
    {
        var activeTokens = await _dbSet
            .Where(t => t.UserId == id && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
            token.Revoke();
    }
}
