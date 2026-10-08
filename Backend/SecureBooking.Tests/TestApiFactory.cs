using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Infrastructure.Persistence;

namespace SecureBooking.Tests;

/// <summary>
/// Hosts the real API pipeline (controllers, MediatR, JWT auth, EF mappings) against in-memory SQLite,
/// with only the outbound call to Google replaced by <see cref="FakeGoogleIdentityProvider"/>.
/// </summary>
public sealed class TestApiFactory : WebApplicationFactory<Program>
{
    public const string FrontendCallback = "http://frontend.test/auth/google/callback";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public FakeGoogleIdentityProvider Google { get; } = new();
    public FakeEmailSender Email { get; } = new();

    /// <summary>Forgot-password requests allowed per window; high by default so unrelated tests never hit the limiter.</summary>
    public int ForgotPasswordLimit { get; init; } = 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.UseEnvironment("Testing");
        builder.UseSetting("JwtSettings:Secret", "test-secret-test-secret-test-secret-1234567890");
        builder.UseSetting("Authentication:Google:RedirectUri", "http://api.test/api/auth/google/callback");
        builder.UseSetting("Authentication:Google:FrontendCallbackUrl", FrontendCallback);
        builder.UseSetting("Email:FrontendBaseUrl", "http://frontend.test");
        builder.UseSetting("RateLimiting:ForgotPassword:PermitLimit", ForgotPasswordLimit.ToString());
        builder.UseSetting("RateLimiting:ResetPassword:PermitLimit", "1000");
        builder.UseSetting("RateLimiting:LinkGoogle:PermitLimit", "1000");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(o => o.UseSqlite(_connection));

            services.RemoveAll<IGoogleIdentityProvider>();
            services.AddSingleton<IGoogleIdentityProvider>(Google);

            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender>(Email);
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.EnsureCreated();
        return host;
    }

    public HttpClient CreateManualClient() =>
        CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false, HandleCookies = false });

    public async Task<T> WithDbAsync<T>(Func<ApplicationDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<ApplicationDbContext>());
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

public sealed class FakeEmailSender : IEmailSender
{
    public sealed record SentEmail(string To, string Subject, string Html);

    private readonly List<SentEmail> _sent = new();

    public IReadOnlyList<SentEmail> For(string to)
    {
        lock (_sent) return _sent.Where(e => e.To.Equals(to, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        lock (_sent) _sent.Add(new SentEmail(toEmail, subject, htmlBody));
        return Task.CompletedTask;
    }
}

public sealed class FakeGoogleIdentityProvider : IGoogleIdentityProvider
{
    public const string InvalidCode = "invalid-code";

    private readonly Dictionary<string, ExternalIdentity> _codes = new();

    public bool IsConfigured => true;

    /// <summary>Registers an identity Google would return, and gets the authorization code that yields it.</summary>
    public string IssueCodeFor(ExternalIdentity identity)
    {
        var code = Guid.NewGuid().ToString("N");
        lock (_codes) _codes[code] = identity;
        return code;
    }

    public string CreateAuthorizationUrl(string state, string nonce, string codeChallenge) =>
        $"https://accounts.google.test/auth?state={Uri.EscapeDataString(state)}&nonce={Uri.EscapeDataString(nonce)}&code_challenge={Uri.EscapeDataString(codeChallenge)}";

    public Task<ExternalIdentity> ExchangeCodeAsync(
        string code, string codeVerifier, string nonce, CancellationToken cancellationToken)
    {
        ExternalIdentity? identity;
        lock (_codes) _codes.TryGetValue(code, out identity);

        if (identity is null || code == InvalidCode)
            throw new UnauthorizedAccessException("Google sign-in failed.");

        return Task.FromResult(identity);
    }
}
