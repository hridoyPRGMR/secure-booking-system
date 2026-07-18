namespace SecureBooking.Application.Features.Authentication.Commands.Refresh;

public record RefreshTokenResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt
);