using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SecureBooking.Api.Infrastructure;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Features.Authentication.Commands.GoogleLogin;
using SecureBooking.Application.Features.Authentication.Commands.LinkGoogleAccount;

namespace SecureBooking.Api.Controllers;

/// <summary>
/// Backend-driven Google sign-in (authorization code + PKCE). The browser is only ever redirected;
/// the client secret, the code exchange and ID-token validation all stay on the server. On success the
/// app issues its own session: the refresh cookie is set here and React obtains the access token
/// through the existing /api/auth/refresh-token call, so no token ever appears in a URL.
/// </summary>
[ApiController]
[Route("api/auth/google")]
public class GoogleAuthController(
    IMediator mediator,
    IGoogleIdentityProvider google,
    IDataProtectionProvider dataProtection,
    IOptions<GoogleAuthSettings> settings,
    ILogger<GoogleAuthController> logger) : ControllerBase
{
    private const string StateCookieName = "google_oauth_state";
    private const string StateCookiePath = "/api/auth/google";
    private const string ProtectorPurpose = "SecureBooking.GoogleOAuthState.v1";

    private IDataProtector Protector => dataProtection.CreateProtector(ProtectorPurpose);

    /// <summary>Starts the flow: stores state/nonce/PKCE verifier in a short-lived cookie and redirects to Google.</summary>
    [HttpGet("start")]
    public IActionResult Start()
    {
        if (!google.IsConfigured)
        {
            logger.LogError("Google sign-in requested but Authentication:Google is not configured.");
            return Redirect(FrontendUrl("error", "google_not_configured"));
        }

        var state = RandomToken(32);
        var nonce = RandomToken(32);
        var verifier = RandomToken(64);
        var challenge = Base64Url(SHA256.HashData(Encoding.ASCII.GetBytes(verifier)));

        Response.Cookies.Append(
            StateCookieName,
            Protector.Protect($"{state}|{nonce}|{verifier}"),
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                // Lax so the cookie is sent on the top-level redirect back from Google.
                SameSite = SameSiteMode.Lax,
                Path = StateCookiePath,
                MaxAge = TimeSpan.FromMinutes(10)
            });

        return Redirect(google.CreateAuthorizationUrl(state, nonce, challenge));
    }

    /// <summary>Google redirects here. Validates state (CSRF), then signs in / registers / requests linking.</summary>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        CancellationToken cancellationToken)
    {
        var flow = ReadAndClearStateCookie();

        if (!string.IsNullOrEmpty(error))
        {
            logger.LogInformation("Google sign-in was not completed: {Error}", error);
            return Redirect(FrontendUrl("error", "access_denied"));
        }

        if (flow is null || string.IsNullOrEmpty(state) || string.IsNullOrEmpty(code) ||
            !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(state), Encoding.UTF8.GetBytes(flow.Value.State)))
        {
            logger.LogWarning("Google callback rejected: missing or mismatched OAuth state.");
            return Redirect(FrontendUrl("error", "invalid_state"));
        }

        try
        {
            var result = await mediator.Send(
                new GoogleLoginCommand(code, flow.Value.Verifier, flow.Value.Nonce), cancellationToken);

            if (result.Status == GoogleLoginStatus.LinkRequired)
            {
                return Redirect(FrontendUrl("link", null, result.Email, result.LinkTicket));
            }

            RefreshTokenCookies.Append(Response, result.Auth!.RefreshToken, result.Auth.RefreshTokenExpiresAt!.Value);
            return Redirect(FrontendUrl("success"));
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Google sign-in rejected: {Reason}", ex.Message);
            return Redirect(FrontendUrl("error", "google_auth_failed"));
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning("Google sign-in refused: {Reason}", ex.Message);
            return Redirect(FrontendUrl("error", "email_not_verified"));
        }
        catch (ConflictException ex)
        {
            logger.LogWarning("Google sign-in conflict: {Reason}", ex.Message);
            return Redirect(FrontendUrl("error", "conflict"));
        }
    }

    /// <summary>Confirms ownership of the existing account (password) and links the Google identity to it.</summary>
    [HttpPost("link")]
    public async Task<IActionResult> Link(LinkGoogleAccountCommand command, CancellationToken cancellationToken)
    {
        var response = await mediator.Send(command, cancellationToken);

        if (response.RefreshTokenExpiresAt is { } expiresAt)
            RefreshTokenCookies.Append(Response, response.RefreshToken, expiresAt);

        return Ok(response);
    }

    private (string State, string Nonce, string Verifier)? ReadAndClearStateCookie()
    {
        var raw = Request.Cookies[StateCookieName];
        Response.Cookies.Delete(StateCookieName, new CookieOptions { Path = StateCookiePath });

        if (string.IsNullOrEmpty(raw)) return null;

        try
        {
            var parts = Protector.Unprotect(raw).Split('|');
            return parts.Length == 3 ? (parts[0], parts[1], parts[2]) : null;
        }
        catch (CryptographicException)
        {
            return null;
        }
    }

    // The target is configuration-only, never request-supplied, so this cannot become an open redirect.
    private string FrontendUrl(string status, string? errorCode = null, string? email = null, string? ticket = null)
    {
        var url = $"{settings.Value.FrontendCallbackUrl}?status={status}";
        if (errorCode is not null) url += $"&error={Uri.EscapeDataString(errorCode)}";
        if (email is not null) url += $"&email={Uri.EscapeDataString(email)}";
        // Fragment: never sent to servers, so the ticket stays out of access logs and Referer headers.
        if (ticket is not null) url += $"#ticket={Uri.EscapeDataString(ticket)}";
        return url;
    }

    private static string RandomToken(int bytes) => Base64Url(RandomNumberGenerator.GetBytes(bytes));

    private static string Base64Url(byte[] data) =>
        Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
