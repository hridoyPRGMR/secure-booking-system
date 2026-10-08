namespace SecureBooking.Application.Common.Authentication;

public sealed class GoogleAuthSettings
{
    public const string SectionName = "Authentication:Google";

    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;

    /// <summary>Must exactly match an "Authorized redirect URI" in Google Cloud Console (the API callback).</summary>
    public string RedirectUri { get; init; } = string.Empty;

    /// <summary>React page the API redirects to after the callback has been processed.</summary>
    public string FrontendCallbackUrl { get; init; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(ClientId) &&
        !string.IsNullOrWhiteSpace(ClientSecret) &&
        !string.IsNullOrWhiteSpace(RedirectUri) &&
        !string.IsNullOrWhiteSpace(FrontendCallbackUrl);
}
