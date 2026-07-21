using System.Text.Json.Serialization;

namespace SecureBooking.Application.Features.Authentication.Commands.Refresh;

public record RefreshTokenResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    [property: JsonIgnore] string RefreshToken,
    [property: JsonIgnore] DateTime RefreshTokenExpiresAt,
    Guid UserId,
    string FirstName,
    string LastName,
    string Email
);