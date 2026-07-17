namespace SecureBooking.Application.Features.Authentication;

public sealed record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    Guid UserId,
    string FirstName,
    string LastName,
    string Email
);