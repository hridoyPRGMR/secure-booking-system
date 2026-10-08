using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using SecureBooking.Infrastructure.Authentication;

namespace SecureBooking.Tests;

/// <summary>Exercises the real ID-token verification used on Google's response (scenario 6).</summary>
public class GoogleIdTokenValidationTests
{
    private const string ClientId = "client-123.apps.googleusercontent.com";
    private const string Nonce = "expected-nonce";

    private static readonly RsaSecurityKey GoogleKey = new(RSA.Create(2048)) { KeyId = "k1" };

    private static string Token(
        string issuer = "https://accounts.google.com",
        string audience = ClientId,
        string nonce = Nonce,
        DateTime? expires = null,
        SecurityKey? key = null,
        bool emailVerified = true)
    {
        var claims = new List<Claim>
        {
            new("sub", "1234567890"),
            new("email", "a@example.com"),
            new("email_verified", emailVerified ? "true" : "false"),
            new("given_name", "Ann"),
            new("nonce", nonce)
        };
        var now = DateTime.UtcNow;
        var jwt = new JwtSecurityToken(issuer, audience, claims,
            notBefore: now.AddHours(-2), expires: expires ?? now.AddMinutes(5),
            signingCredentials: new SigningCredentials(key ?? GoogleKey, SecurityAlgorithms.RsaSha256));
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }

    private static Infrastructure_Result Validate(string token) => new(
        GoogleIdentityProvider.ValidateIdToken(token, ClientId, Nonce, [GoogleKey]));

    private sealed record Infrastructure_Result(SecureBooking.Application.Common.Authentication.ExternalIdentity Identity);

    [Fact]
    public void ValidToken_YieldsStableSubjectAndVerifiedEmail()
    {
        var identity = Validate(Token()).Identity;

        Assert.Equal("Google", identity.Provider);
        Assert.Equal("1234567890", identity.ProviderUserId);
        Assert.Equal("a@example.com", identity.Email);
        Assert.True(identity.EmailVerified);
    }

    [Fact]
    public void LegacyIssuerWithoutScheme_IsAccepted() =>
        Validate(Token(issuer: "accounts.google.com"));

    [Fact]
    public void ExpiredToken_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() =>
            Validate(Token(expires: DateTime.UtcNow.AddMinutes(-10))));

    [Fact]
    public void TokenForAnotherClient_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() => Validate(Token(audience: "someone-else")));

    [Fact]
    public void TokenFromAnotherIssuer_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() => Validate(Token(issuer: "https://evil.example")));

    [Fact]
    public void WrongNonce_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() => Validate(Token(nonce: "replayed-nonce")));

    [Fact]
    public void TokenSignedWithUnknownKey_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() =>
            Validate(Token(key: new RsaSecurityKey(RSA.Create(2048)) { KeyId = "k1" })));

    [Fact]
    public void Garbage_IsRejected() =>
        Assert.Throws<UnauthorizedAccessException>(() => Validate("not-a-jwt"));

    [Fact]
    public void UnverifiedEmailClaim_IsReportedAsUnverified() =>
        Assert.False(Validate(Token(emailVerified: false)).Identity.EmailVerified);
}
