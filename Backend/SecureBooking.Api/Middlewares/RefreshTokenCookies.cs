namespace SecureBooking.Api.Infrastructure;

/// <summary>The single place that writes the HttpOnly refresh-token cookie.</summary>
public static class RefreshTokenCookies
{
    public const string Name = "refreshToken";

    public static void Append(HttpResponse response, string refreshToken, DateTime expiresAt)
    {
        response.Cookies.Append(
            Name,
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = expiresAt
            });
    }
}
