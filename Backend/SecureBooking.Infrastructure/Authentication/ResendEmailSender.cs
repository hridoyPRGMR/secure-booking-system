using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SecureBooking.Application.Common.Authentication;

namespace SecureBooking.Infrastructure.Authentication;

/// <summary>
/// Sends mail through the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
/// With no Resend:ApiKey nothing is sent; in Development the message (which contains the reset link) is logged
/// so the flow can be tried locally.
/// </summary>
public sealed class ResendEmailSender(
    HttpClient http,
    IOptions<ResendSettings> resend,
    IOptions<EmailSettings> email,
    IHostEnvironment environment,
    ILogger<ResendEmailSender> logger) : IEmailSender
{
    private const string Endpoint = "https://api.resend.com/emails";

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var apiKey = resend.Value.ApiKey;
        var from = email.Value;

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(from.FromAddress))
        {
            logger.LogWarning("Resend is not configured (Resend:ApiKey / Email:FromAddress); email '{Subject}' was not sent.", subject);
            if (environment.IsDevelopment())
                logger.LogInformation("DEV email to {To}: {Body}", toEmail, htmlBody);
            return;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = JsonContent.Create(new
            {
                from = $"{from.FromName} <{from.FromAddress}>",
                to = new[] { toEmail },
                subject,
                html = htmlBody
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await http.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            // Status only: the response/request bodies can contain the recipient address and the reset link.
            throw new InvalidOperationException($"Resend rejected the email with status {(int)response.StatusCode}.");
        }

        logger.LogInformation("Sent email '{Subject}' via Resend.", subject);
    }
}
