using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository(DbSet<RefreshToken> dbset) : IRefreshTokenRepository
{
    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken)
    {
        await dbset.AddAsync(refreshToken,cancellationToken);
    }

    public Task<RefreshToken?> GetByHashAsync(string hash, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task RevokeAllForUserAsync(Guid id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}