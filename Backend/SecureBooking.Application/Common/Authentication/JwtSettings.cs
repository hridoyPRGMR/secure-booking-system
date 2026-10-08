namespace SecureBooking.Application.Features.Authentication
{
    public sealed class JwtSettings
    {
        public const string SectionName = "JwtSettings";

        public string Secret { get; init; } = string.Empty;
        public string Issuer { get; init; } = string.Empty;
        public string Audience { get; init; } = string.Empty;

        public int AccessTokenExpirationMinutes { get; init; } = 15;
        public int RefreshTokenExpirationDays { get; init; } = 30;

        /// <summary>SameSite for the refresh cookie: Strict (default), Lax or None (cross-site SPA + API).</summary>
        public string RefreshCookieSameSite { get; init; } = "Strict";
    }
}