namespace SecureBooking.Application.Common.Authentication;

public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken);
}

public sealed class EmailSettings
{
    public const string SectionName = "Email";

    /// <summary>Sender address. Must belong to a domain verified in Resend (or onboarding@resend.dev for testing).</summary>
    public string FromAddress { get; init; } = string.Empty;
    public string FromName { get; init; } = "SecureBooking";

    /// <summary>Public URL of the React app, used to build links in emails (no trailing slash).</summary>
    public string FrontendBaseUrl { get; init; } = string.Empty;
}

public sealed class ResendSettings
{
    public const string SectionName = "Resend";

    /// <summary>Resend API key (secret). Leave empty to disable sending; the API then only logs.</summary>
    public string ApiKey { get; init; } = string.Empty;
}
