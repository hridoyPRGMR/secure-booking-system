namespace SecureBooking.Application.Common.Authentication;

public sealed record TokenResult
{
    public required string AccessToken { get; init; }
    public required DateTime AccessTokenExpiresAt { get; init; }
    public string? RefreshToken { get; init; }
    public DateTime? RefreshTokenExpiresAt { get; init; }

    public static TokenResult FromAccessToken(string accessToken, DateTime expireAt)
        => new()
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = expireAt,
        };

    public static TokenResult FromFull(
        string accessToken,
        TimeSpan accessLifetime,
        string refreshToken,
        TimeSpan refreshLifetime)
        => new()
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = DateTime.UtcNow.Add(accessLifetime),
            RefreshToken = refreshToken,
            RefreshTokenExpiresAt = DateTime.UtcNow.Add(refreshLifetime),
        };
}