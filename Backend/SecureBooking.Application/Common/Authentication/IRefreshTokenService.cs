using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Features.Authentication.Commands.Refresh;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Authentication;

public interface IRefreshTokenService
{
    Task<RefreshTokenResult> CreateAsync(
        User user,
        CancellationToken cancellationToken);

    Task RevokeAsync(
        string refreshToken,
        CancellationToken cancellationToken);

    Task<RefreshTokenResponse> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken);
}