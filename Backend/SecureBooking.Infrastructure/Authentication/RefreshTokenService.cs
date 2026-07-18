using System.Security.Cryptography;
using System.Text;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Authentication.Commands.Refresh;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Authentication;

public class RefreshTokenService(
    IRefreshTokenGenerator generator,
    IRefreshTokenRepository repository,
    IUnitOfWork unitOfWork,
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    IRefreshTokenGenerator refreshTokenGenerator,
    IJwtTokenGenerator jwtTokenGenerator

) : IRefreshTokenService
{
    public async Task<RefreshTokenResult> CreateAsync(User user, CancellationToken cancellationToken)
    {
        var result = generator.Generate();

        var entity = new RefreshToken(
            user.Id,
            result.TokenHash,
            result.ExpiresAt);

        await repository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return result;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var hash = Convert.ToHexString(
                    SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken)));

        var token = await repository.GetByHashAsync(
            hash,
            cancellationToken);

        if (token is null)
            return;

        token.Revoke();

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<RefreshTokenResponse> RefreshAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var tokenHash = ComputeHash(refreshToken);

        var storedToken = await refreshTokenRepository.GetByHashAsync(
            tokenHash,
            cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var user = await userRepository.GetByIdAsync(
            storedToken.UserId,
            cancellationToken);

        if (user is null || !user.IsActive)
            throw new UnauthorizedAccessException("User not found.");

        var accessToken = jwtTokenGenerator.Generate(user);
        var newRefreshToken = refreshTokenGenerator.Generate();

        storedToken.Revoke(newRefreshToken.TokenHash);

        await refreshTokenRepository.AddAsync(
            new RefreshToken(
                user.Id,
                newRefreshToken.TokenHash,
                newRefreshToken.ExpiresAt
            ),
            cancellationToken);
            
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResponse(
            accessToken.AccessToken,
            accessToken.AccessTokenExpiresAt,
            newRefreshToken.Token,
            newRefreshToken.ExpiresAt);
    }

     private static string ComputeHash(string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));
    }

}