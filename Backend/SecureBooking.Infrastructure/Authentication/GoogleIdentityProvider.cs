using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Authentication;

/// <summary>
/// Google OpenID Connect (authorization code + PKCE). The code is exchanged server-side with the client
/// secret and the returned ID token is verified (signature via Google JWKS, issuer, audience, expiry, nonce).
/// The Google access token is never used or stored: only the verified identity claims are consumed.
/// </summary>
public sealed class GoogleIdentityProvider : IGoogleIdentityProvider
{
    private const string DiscoveryUrl = "https://accounts.google.com/.well-known/openid-configuration";
    private const string AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string TokenEndpoint = "https://oauth2.googleapis.com/token";
    private static readonly string[] ValidIssuers = ["https://accounts.google.com", "accounts.google.com"];

    private static readonly ConfigurationManager<OpenIdConnectConfiguration> ConfigurationManager = new(
        DiscoveryUrl,
        new OpenIdConnectConfigurationRetriever(),
        new HttpDocumentRetriever { RequireHttps = true });

    private readonly HttpClient _http;
    private readonly GoogleAuthSettings _settings;
    private readonly ILogger<GoogleIdentityProvider> _logger;

    public GoogleIdentityProvider(
        HttpClient http,
        IOptions<GoogleAuthSettings> settings,
        ILogger<GoogleIdentityProvider> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;
    }

    public bool IsConfigured => _settings.IsConfigured;

    public string CreateAuthorizationUrl(string state, string nonce, string codeChallenge)
    {
        var query = new Dictionary<string, string>
        {
            ["client_id"] = _settings.ClientId,
            ["redirect_uri"] = _settings.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = "openid email profile",
            ["state"] = state,
            ["nonce"] = nonce,
            ["code_challenge"] = codeChallenge,
            ["code_challenge_method"] = "S256",
            ["prompt"] = "select_account"
        };

        return AuthorizationEndpoint + "?" +
               string.Join("&", query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
    }

    public async Task<ExternalIdentity> ExchangeCodeAsync(
        string code, string codeVerifier, string nonce, CancellationToken cancellationToken)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Google sign-in is not configured.");

        using var response = await _http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _settings.ClientId,
            ["client_secret"] = _settings.ClientSecret,
            ["redirect_uri"] = _settings.RedirectUri,
            ["grant_type"] = "authorization_code",
            ["code_verifier"] = codeVerifier
        }), cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            // Status only: never log request/response bodies (they can carry codes and tokens).
            _logger.LogWarning("Google token exchange failed with status {StatusCode}.", (int)response.StatusCode);
            throw new UnauthorizedAccessException("Google sign-in failed.");
        }

        var tokens = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(cancellationToken);
        if (string.IsNullOrEmpty(tokens?.IdToken))
            throw new UnauthorizedAccessException("Google sign-in failed.");

        var config = await ConfigurationManager.GetConfigurationAsync(cancellationToken);
        return ValidateIdToken(tokens.IdToken, _settings.ClientId, nonce, config.SigningKeys);
    }

    /// <summary>Validates a Google ID token and maps it to an <see cref="ExternalIdentity"/>.</summary>
    public static ExternalIdentity ValidateIdToken(
        string idToken, string clientId, string expectedNonce, IEnumerable<SecurityKey> signingKeys)
    {
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };

        try
        {
            var principal = handler.ValidateToken(idToken, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = ValidIssuers,
                ValidateAudience = true,
                ValidAudience = clientId,
                ValidateLifetime = true,
                RequireExpirationTime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys,
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out _);

            var nonce = principal.FindFirst("nonce")?.Value;
            if (string.IsNullOrEmpty(nonce) || !string.Equals(nonce, expectedNonce, StringComparison.Ordinal))
                throw new UnauthorizedAccessException("Google sign-in failed.");

            var sub = principal.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(sub))
                throw new UnauthorizedAccessException("Google sign-in failed.");

            return new ExternalIdentity(
                ExternalLogin.GoogleProvider,
                sub,
                principal.FindFirst("email")?.Value ?? string.Empty,
                string.Equals(principal.FindFirst("email_verified")?.Value, "true", StringComparison.OrdinalIgnoreCase),
                principal.FindFirst("given_name")?.Value,
                principal.FindFirst("family_name")?.Value,
                principal.FindFirst("picture")?.Value);
        }
        catch (Exception ex) when (ex is SecurityTokenException or ArgumentException)
        {
            throw new UnauthorizedAccessException("Google sign-in failed.");
        }
    }

    private sealed record GoogleTokenResponse([property: JsonPropertyName("id_token")] string? IdToken);
}
