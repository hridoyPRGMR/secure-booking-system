using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Features.Authentication;

namespace SecureBooking.Infrastructure.Authentication;

/// <summary>
/// Link tickets are HMAC-signed JWTs with their own audience, so they can never be accepted as an API
/// bearer token (and API tokens can never be accepted as tickets). They expire after 10 minutes.
/// </summary>
public sealed class LinkTicketService(IOptions<JwtSettings> jwtSettings) : ILinkTicketService
{
    public const string Audience = "SecureBooking.ExternalLink";
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    private readonly JwtSettings _settings = jwtSettings.Value;

    public string Create(Guid userId, ExternalIdentity identity)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new("provider", identity.Provider),
            new("provider_user_id", identity.ProviderUserId),
            new(JwtRegisteredClaimNames.Email, identity.Email.ToLowerInvariant())
        };
        if (identity.FirstName is not null) claims.Add(new("given_name", identity.FirstName));
        if (identity.LastName is not null) claims.Add(new("family_name", identity.LastName));

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.Add(Lifetime),
            signingCredentials: new SigningCredentials(Key(), SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public LinkTicket Validate(string ticket)
    {
        try
        {
            var principal = new JwtSecurityTokenHandler { MapInboundClaims = false }.ValidateToken(ticket,
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _settings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = Audience,
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = Key(),
                    ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                    ClockSkew = TimeSpan.Zero
                }, out _);

            var userId = Guid.Parse(principal.FindFirst("sub")!.Value);
            var identity = new ExternalIdentity(
                principal.FindFirst("provider")!.Value,
                principal.FindFirst("provider_user_id")!.Value,
                principal.FindFirst("email")!.Value,
                EmailVerified: true,
                principal.FindFirst("given_name")?.Value,
                principal.FindFirst("family_name")?.Value,
                PictureUrl: null);

            return new LinkTicket(userId, identity);
        }
        catch (Exception ex) when (ex is SecurityTokenException or ArgumentException or FormatException or NullReferenceException)
        {
            throw new UnauthorizedAccessException("Invalid or expired link request.");
        }
    }

    private SymmetricSecurityKey Key() => new(Encoding.UTF8.GetBytes(_settings.Secret));
}
