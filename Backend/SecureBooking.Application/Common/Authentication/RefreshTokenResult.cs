namespace SecureBooking.Application.Common.Authentication;

public sealed record RefreshTokenResult(
    string Token,
    string TokenHash,
    DateTime ExpiresAt
);