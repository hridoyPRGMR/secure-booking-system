namespace SecureBooking.Application.Common.Authentication;

public interface IGoogleIdentityProvider
{
    bool IsConfigured { get; }

    string CreateAuthorizationUrl(string state, string nonce, string codeChallenge);

    /// <summary>
    /// Exchanges the authorization code (server-side, with the client secret) and validates the returned
    /// ID token. Throws <see cref="UnauthorizedAccessException"/> when the result is invalid or expired.
    /// </summary>
    Task<ExternalIdentity> ExchangeCodeAsync(string code, string codeVerifier, string nonce, CancellationToken cancellationToken);
}
