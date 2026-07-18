using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Repositories;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken,CancellationToken cancellationToken);

    Task<RefreshToken?> GetByHashAsync(string hash, CancellationToken cancellationToken);

    Task RevokeAllForUserAsync(Guid id,CancellationToken cancellationToken);
}