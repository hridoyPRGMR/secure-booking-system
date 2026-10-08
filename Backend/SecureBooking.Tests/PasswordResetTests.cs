using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Authentication;

namespace SecureBooking.Tests;

public class PasswordResetTests(TestApiFactory factory) : IClassFixture<TestApiFactory>
{
    private const string OldPassword = "Passw0rdOK";
    private const string NewPassword = "Brand-New-Passw0rd";

    private static string UniqueEmail() => $"reset-{Guid.NewGuid():N}@example.com";

    private static async Task<Guid> RegisterAsync(TestApiFactory f, string email)
    {
        var response = await f.CreateManualClient().PostAsJsonAsync("/api/auth/register",
            new { firstName = "Rita", lastName = "Regular", email, password = OldPassword });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>()).GetProperty("userId").GetGuid();
    }

    private static Task<HttpResponseMessage> ForgotAsync(TestApiFactory f, string email) =>
        f.CreateManualClient().PostAsJsonAsync("/api/auth/forgot-password", new { email });

    private static Task<HttpResponseMessage> ResetAsync(TestApiFactory f, string token, string password) =>
        f.CreateManualClient().PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = password });

    private static Task<HttpResponseMessage> LoginAsync(TestApiFactory f, string email, string password) =>
        f.CreateManualClient().PostAsJsonAsync("/api/auth/login", new { email, password });

    private static string TokenFrom(FakeEmailSender.SentEmail email)
    {
        var match = Regex.Match(email.Html, "http://frontend\\.test/reset-password#token=([^\"]+)\"");
        Assert.True(match.Success, "reset link not found in email");
        return match.Groups[1].Value;
    }

    [Fact]
    public async Task ForgotPassword_EmailsAResetLink_AndResetChangesThePassword()
    {
        var email = UniqueEmail();
        await RegisterAsync(factory, email);

        Assert.Equal(HttpStatusCode.NoContent, (await ForgotAsync(factory, email)).StatusCode);

        var token = TokenFrom(Assert.Single(factory.Email.For(email)));

        // The raw token is never stored, only its hash.
        Assert.False(await factory.WithDbAsync(db => db.PasswordResetTokens.AnyAsync(t => t.TokenHash == token)));

        Assert.Equal(HttpStatusCode.NoContent, (await ResetAsync(factory, token, NewPassword)).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, email, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, email, OldPassword)).StatusCode);
    }

    [Fact]
    public async Task ResetLink_WorksOnlyOnce()
    {
        var email = UniqueEmail();
        await RegisterAsync(factory, email);
        await ForgotAsync(factory, email);
        var token = TokenFrom(Assert.Single(factory.Email.For(email)));

        Assert.Equal(HttpStatusCode.NoContent, (await ResetAsync(factory, token, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(factory, token, "Another-Passw0rd")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, email, NewPassword)).StatusCode);
    }

    [Fact]
    public async Task ExpiredOrUnknownToken_IsRejected()
    {
        var email = UniqueEmail();
        var userId = await RegisterAsync(factory, email);
        await ForgotAsync(factory, email);
        var token = TokenFrom(Assert.Single(factory.Email.For(email)));

        await factory.WithDbAsync(async db =>
        {
            await db.PasswordResetTokens.Where(t => t.UserId == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.ExpiresAt, DateTime.UtcNow.AddMinutes(-1)));
            return 0;
        });

        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(factory, token, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(factory, "not-a-real-token", NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, email, OldPassword)).StatusCode);
    }

    [Fact]
    public async Task UnknownEmail_GetsSameResponse_AndNoEmailIsSent()
    {
        var email = UniqueEmail();

        var response = await ForgotAsync(factory, email);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty(factory.Email.For(email));
    }

    [Fact]
    public async Task RequestingAgain_InvalidatesTheEarlierLink_AndIsThrottledPerAccount()
    {
        var email = UniqueEmail();
        var userId = await RegisterAsync(factory, email);
        await ForgotAsync(factory, email);
        var first = TokenFrom(Assert.Single(factory.Email.For(email)));

        // Immediate second request: throttled per account, so no second email.
        await ForgotAsync(factory, email);
        Assert.Single(factory.Email.For(email));

        // After the throttle window a new request issues a new link and kills the old one.
        await factory.WithDbAsync(async db =>
        {
            await db.PasswordResetTokens.Where(t => t.UserId == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.CreatedAt, DateTime.UtcNow.AddMinutes(-5)));
            return 0;
        });
        await ForgotAsync(factory, email);
        var second = TokenFrom(factory.Email.For(email).Last());

        Assert.NotEqual(first, second);
        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(factory, first, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await ResetAsync(factory, second, NewPassword)).StatusCode);
    }

    [Fact]
    public async Task Reset_SignsOutExistingSessions()
    {
        var email = UniqueEmail();
        await RegisterAsync(factory, email);

        var login = await LoginAsync(factory, email, OldPassword);
        var cookie = login.Headers.GetValues("Set-Cookie").First(c => c.StartsWith("refreshToken=")).Split(';')[0];

        await ForgotAsync(factory, email);
        var token = TokenFrom(Assert.Single(factory.Email.For(email)));
        await ResetAsync(factory, token, NewPassword);

        var refresh = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token");
        refresh.Headers.Add("Cookie", cookie);
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateManualClient().SendAsync(refresh)).StatusCode);
    }

    [Fact]
    public async Task WeakNewPassword_IsRejected_AndTheLinkStaysUsable()
    {
        var email = UniqueEmail();
        await RegisterAsync(factory, email);
        await ForgotAsync(factory, email);
        var token = TokenFrom(Assert.Single(factory.Email.For(email)));

        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(factory, token, "short")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await ResetAsync(factory, token, NewPassword)).StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_IsRateLimitedPerClient_With429AndRetryAfter()
    {
        using var limited = new TestApiFactory { ForgotPasswordLimit = 2 };
        var email = UniqueEmail();

        Assert.Equal(HttpStatusCode.NoContent, (await ForgotAsync(limited, email)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await ForgotAsync(limited, email)).StatusCode);

        var blocked = await ForgotAsync(limited, email);
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);
        Assert.True(blocked.Headers.Contains("Retry-After"));
    }

    [Fact]
    public async Task GoogleOnlyCustomer_CanSetAPasswordThroughReset()
    {
        var email = UniqueEmail();
        var identity = new ExternalIdentity("Google", Guid.NewGuid().ToString("N"), email, true, "Gina", "Google", null);
        var code = factory.Google.IssueCodeFor(identity);

        var client = factory.CreateManualClient();
        var start = await client.GetAsync("/api/auth/google/start");
        var state = System.Web.HttpUtility.ParseQueryString(start.Headers.Location!.Query)["state"]!;
        var cookie = start.Headers.GetValues("Set-Cookie").First(c => c.StartsWith("google_oauth_state=")).Split(';')[0];
        var callback = new HttpRequestMessage(HttpMethod.Get, $"/api/auth/google/callback?code={code}&state={state}");
        callback.Headers.Add("Cookie", cookie);
        await client.SendAsync(callback);

        await ForgotAsync(factory, email);
        var token = TokenFrom(Assert.Single(factory.Email.For(email)));
        Assert.Equal(HttpStatusCode.NoContent, (await ResetAsync(factory, token, NewPassword)).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, email, NewPassword)).StatusCode);
    }
}
