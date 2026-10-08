using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands.GoogleLogin;

/// <param name="Code">Authorization code returned by Google to the API callback.</param>
/// <param name="CodeVerifier">PKCE verifier generated when the flow started.</param>
/// <param name="Nonce">Nonce generated when the flow started; must match the ID token.</param>
public sealed record GoogleLoginCommand(string Code, string CodeVerifier, string Nonce)
    : IRequest<GoogleLoginResult>;

public enum GoogleLoginStatus
{
    Authenticated,
    /// <summary>An account with this verified email exists; the user must prove ownership before linking.</summary>
    LinkRequired
}

public sealed record GoogleLoginResult(
    GoogleLoginStatus Status,
    AuthResponse? Auth,
    string? LinkTicket,
    string? Email);
