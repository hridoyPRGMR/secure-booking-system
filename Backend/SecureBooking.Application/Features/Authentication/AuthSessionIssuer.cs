using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Authentication;

/// <summary>
/// Issues the application's own access token + refresh token for a user. Used by sign-in paths other than
/// email/password so external logins end up with exactly the same session as a normal login.
/// The user must be loaded with Roles and their Permissions.
/// </summary>
public sealed class AuthSessionIssuer(
    IJwtTokenGenerator tokenGenerator,
    IRefreshTokenService refreshTokenService,
    IUnitOfWork unitOfWork)
{
    public async Task<AuthResponse> IssueAsync(User user, CancellationToken cancellationToken)
    {
        var accessToken = tokenGenerator.Generate(user);
        var refreshToken = await refreshTokenService.CreateAsync(user, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissionCodes = user.Roles.SelectMany(r => r.Permissions).Select(p => p.Code).Distinct().ToList();

        return new AuthResponse(
            accessToken.AccessToken,
            accessToken.AccessTokenExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            roleNames,
            permissionCodes);
    }
}
