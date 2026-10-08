using Microsoft.Extensions.Options;
using SecureBooking.Application.Features.Authentication;

namespace SecureBooking.Api.Infrastructure;

/// <summary>The single place that writes the HttpOnly refresh-token cookie.</summary>
public static class RefreshTokenCookies
{
    public const string Name = "refreshToken";

    public static void Append(HttpResponse response, string refreshToken, DateTime expiresAt)
    {
        var settings = response.HttpContext.RequestServices.GetRequiredService<IOptions<JwtSettings>>().Value;

        response.Cookies.Append(
            Name,
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                // "Strict" when the SPA and API share a site; "None" when they are on different sites
                // (e.g. *.azurestaticapps.net calling *.azurewebsites.net). Set via JwtSettings:RefreshCookieSameSite.
                SameSite = Enum.TryParse<SameSiteMode>(settings.RefreshCookieSameSite, true, out var mode)
                    ? mode
                    : SameSiteMode.Strict,
                Expires = expiresAt
            });
    }
}
