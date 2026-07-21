using System.Text.Json.Serialization;

namespace SecureBooking.Application.Features.Authentication;

public sealed record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    [property: JsonIgnore] string RefreshToken,
    [property: JsonIgnore] DateTime? RefreshTokenExpiresAt,
    Guid UserId,
    string FirstName,
    string LastName,
    string Email
);