using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Domain.Entities;
using SecureBooking.Infrastructure.Authentication;

namespace SecureBooking.Tests;

public class GoogleAuthTests(TestApiFactory factory) : IClassFixture<TestApiFactory>
{
    private const string Password = "Passw0rdOK";

    private static string UniqueEmail(string prefix = "user") => $"{prefix}-{Guid.NewGuid():N}@example.com";

    private static ExternalIdentity Identity(string email, string? sub = null, bool verified = true) =>
        new("Google", sub ?? Guid.NewGuid().ToString("N"), email, verified, "Gina", "Google", "https://pics.test/g.png");

    // ---- helpers -------------------------------------------------------------------------------

    private sealed record CallbackResult(Uri Location, string? RefreshCookie, string? Ticket)
    {
        public string? Query(string key) =>
            System.Web.HttpUtility.ParseQueryString(Location.Query)[key];
    }

    /// <summary>Runs the full browser flow: /start (state cookie) -> Google -> /callback.</summary>
    private async Task<CallbackResult> SignInWithGoogleAsync(ExternalIdentity identity)
        => await CallbackAsync(factory.Google.IssueCodeFor(identity));

    private async Task<CallbackResult> CallbackAsync(
        string code, string? stateOverride = null, bool sendStateCookie = true, string? query = null)
    {
        var client = factory.CreateManualClient();

        var start = await client.GetAsync("/api/auth/google/start");
        Assert.Equal(HttpStatusCode.Redirect, start.StatusCode);
        var google = start.Headers.Location!;
        var state = System.Web.HttpUtility.ParseQueryString(google.Query)["state"]!;
        var stateCookie = CookieValue(start, "google_oauth_state");
        Assert.NotNull(stateCookie);

        var request = new HttpRequestMessage(HttpMethod.Get,
            query ?? $"/api/auth/google/callback?code={Uri.EscapeDataString(code)}&state={Uri.EscapeDataString(stateOverride ?? state)}");
        if (sendStateCookie) request.Headers.Add("Cookie", $"google_oauth_state={stateCookie}");

        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);

        var location = response.Headers.Location!;
        var ticket = location.Fragment.StartsWith("#ticket=")
            ? Uri.UnescapeDataString(location.Fragment["#ticket=".Length..])
            : null;
        return new CallbackResult(location, CookieValue(response, "refreshToken"), ticket);
    }

    private static string? CookieValue(HttpResponseMessage response, string name)
    {
        if (!response.Headers.TryGetValues("Set-Cookie", out var values)) return null;
        foreach (var header in values)
        {
            var first = header.Split(';')[0];
            if (first.StartsWith(name + "=") && first.Length > name.Length + 1)
                return first[(name.Length + 1)..];
        }
        return null;
    }

    private static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<JsonElement>());

    /// <summary>Exchanges the refresh cookie for an access token, like the React app does after the callback.</summary>
    private async Task<(string AccessToken, string Email)> RefreshAsync(string refreshCookie)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token");
        request.Headers.Add("Cookie", $"refreshToken={refreshCookie}");
        var response = await factory.CreateManualClient().SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJsonAsync(response);
        return (json.GetProperty("accessToken").GetString()!, json.GetProperty("email").GetString()!);
    }

    private async Task<Guid> RegisterAsync(string email)
    {
        var response = await factory.CreateManualClient().PostAsJsonAsync("/api/auth/register",
            new { firstName = "Rita", lastName = "Regular", email, password = Password });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await ReadJsonAsync(response)).GetProperty("userId").GetGuid();
    }

    // ---- 1. new customer ---------------------------------------------------------------------

    [Fact]
    public async Task NewGoogleCustomer_CreatesCustomerAndExternalLogin_AndIssuesAppSession()
    {
        var identity = Identity(UniqueEmail("new"));

        var result = await SignInWithGoogleAsync(identity);

        Assert.Equal("success", result.Query("status"));
        Assert.NotNull(result.RefreshCookie);
        Assert.DoesNotContain("token", result.Location.ToString(), StringComparison.OrdinalIgnoreCase);

        var (user, logins) = await factory.WithDbAsync(async db =>
        {
            var u = await db.Users.SingleAsync(x => x.Email == identity.Email);
            return (u, await db.ExternalLogins.Where(l => l.UserId == u.Id).ToListAsync());
        });

        var login = Assert.Single(logins);
        Assert.Equal("Google", login.Provider);
        Assert.Equal(identity.ProviderUserId, login.ProviderUserId);
        Assert.Equal("Gina", user.FirstName);
        Assert.Equal("https://pics.test/g.png", user.ProfilePictureUrl);

        var (_, email) = await RefreshAsync(result.RefreshCookie!);
        Assert.Equal(identity.Email, email);
    }

    // ---- 2. existing Google customer ----------------------------------------------------------

    [Fact]
    public async Task ExistingGoogleCustomer_IsAuthenticatedAsSameCustomer_WithoutDuplicates()
    {
        var identity = Identity(UniqueEmail("again"));

        var first = await SignInWithGoogleAsync(identity);
        var second = await SignInWithGoogleAsync(identity);

        Assert.Equal("success", second.Query("status"));
        Assert.NotNull(second.RefreshCookie);

        var counts = await factory.WithDbAsync(async db => (
            await db.Users.CountAsync(u => u.Email == identity.Email),
            await db.ExternalLogins.CountAsync(l => l.ProviderUserId == identity.ProviderUserId)));
        Assert.Equal((1, 1), counts);

        Assert.Equal(identity.Email, (await RefreshAsync(first.RefreshCookie!)).Email);
        Assert.Equal(identity.Email, (await RefreshAsync(second.RefreshCookie!)).Email);
    }

    [Fact]
    public async Task ExistingGoogleCustomer_IsMatchedBySubject_EvenIfGoogleEmailChanged()
    {
        var sub = Guid.NewGuid().ToString("N");
        var original = Identity(UniqueEmail("orig"), sub);
        await SignInWithGoogleAsync(original);

        var renamed = Identity(UniqueEmail("renamed"), sub);
        var result = await SignInWithGoogleAsync(renamed);

        Assert.Equal("success", result.Query("status"));
        Assert.Equal(original.Email, (await RefreshAsync(result.RefreshCookie!)).Email);
        Assert.False(await factory.WithDbAsync(db => db.Users.AnyAsync(u => u.Email == renamed.Email)));
    }

    // ---- 3. same verified email -> secure linking ---------------------------------------------

    [Fact]
    public async Task ExistingCustomerWithSameVerifiedEmail_RequiresConfirmation_BeforeLinking()
    {
        var email = UniqueEmail("a123");
        var userId = await RegisterAsync(email);
        var identity = Identity(email);

        var result = await SignInWithGoogleAsync(identity);

        // Not signed in, nothing linked, just a ticket to confirm with.
        Assert.Equal("link", result.Query("status"));
        Assert.Equal(email, result.Query("email"));
        Assert.Null(result.RefreshCookie);
        Assert.NotNull(result.Ticket);
        Assert.False(await factory.WithDbAsync(db => db.ExternalLogins.AnyAsync(l => l.ProviderUserId == identity.ProviderUserId)));

        var client = factory.CreateManualClient();

        // Wrong password: rejected, still not linked.
        var wrong = await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = result.Ticket, password = "Wrong-Password1" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.False(await factory.WithDbAsync(db => db.ExternalLogins.AnyAsync(l => l.ProviderUserId == identity.ProviderUserId)));

        // Correct password: linked to the ORIGINAL customer and a normal session is issued.
        var ok = await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = result.Ticket, password = Password });
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal(userId, (await ReadJsonAsync(ok)).GetProperty("userId").GetGuid());
        Assert.NotNull(CookieValue(ok, "refreshToken"));

        var link = await factory.WithDbAsync(db => db.ExternalLogins.SingleAsync(l => l.ProviderUserId == identity.ProviderUserId));
        Assert.Equal(userId, link.UserId);

        // From now on Google signs straight into that customer.
        var again = await SignInWithGoogleAsync(identity);
        Assert.Equal("success", again.Query("status"));
        Assert.Equal(email, (await RefreshAsync(again.RefreshCookie!)).Email);
    }

    [Fact]
    public async Task UnverifiedGoogleEmail_IsRefused_AndNeverLinksOrRegisters()
    {
        var email = UniqueEmail("victim");
        await RegisterAsync(email);
        var identity = Identity(email, verified: false);

        var result = await SignInWithGoogleAsync(identity);

        Assert.Equal("error", result.Query("status"));
        Assert.Equal("email_not_verified", result.Query("error"));
        Assert.Null(result.RefreshCookie);
        Assert.Null(result.Ticket);
        Assert.False(await factory.WithDbAsync(db => db.ExternalLogins.AnyAsync(l => l.ProviderUserId == identity.ProviderUserId)));
    }

    // ---- 4. different Google email -------------------------------------------------------------

    [Fact]
    public async Task GoogleAccountWithDifferentEmail_IsNotAttachedToExistingCustomer()
    {
        var existingEmail = UniqueEmail("a123");
        var existingId = await RegisterAsync(existingEmail);
        var identity = Identity(UniqueEmail("another"));

        var result = await SignInWithGoogleAsync(identity);

        // Treated as a different identity -> its own new customer; the existing one is untouched.
        Assert.Equal("success", result.Query("status"));
        var (existingLinks, newUser) = await factory.WithDbAsync(async db => (
            await db.ExternalLogins.CountAsync(l => l.UserId == existingId),
            await db.Users.SingleAsync(u => u.Email == identity.Email)));
        Assert.Equal(0, existingLinks);
        Assert.NotEqual(existingId, newUser.Id);
        Assert.Equal(identity.Email, (await RefreshAsync(result.RefreshCookie!)).Email);
    }

    // ---- 5. one Google account, one customer ---------------------------------------------------

    [Fact]
    public async Task SameGoogleAccount_CannotBeLinkedToTwoCustomers()
    {
        var emailA = UniqueEmail("first");
        var emailB = UniqueEmail("second");
        await RegisterAsync(emailA);
        var userB = await RegisterAsync(emailB);

        var identity = Identity(emailA);
        var ticketA = (await SignInWithGoogleAsync(identity)).Ticket!;
        var client = factory.CreateManualClient();
        Assert.Equal(HttpStatusCode.OK,
            (await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = ticketA, password = Password })).StatusCode);

        // A ticket for customer B carrying the same Google subject (forged here via the signing service).
        var forged = factory.Services.CreateScope().ServiceProvider
            .GetRequiredService<ILinkTicketService>().Create(userB, identity with { Email = emailB });
        var response = await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = forged, password = Password });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal(1, await factory.WithDbAsync(db => db.ExternalLogins.CountAsync(l => l.ProviderUserId == identity.ProviderUserId)));
    }

    [Fact]
    public async Task Database_RejectsDuplicateProviderIdentity()
    {
        var u1 = await RegisterAsync(UniqueEmail("dup1"));
        var u2 = await RegisterAsync(UniqueEmail("dup2"));
        var sub = Guid.NewGuid().ToString("N");

        await factory.WithDbAsync(async db =>
        {
            db.ExternalLogins.Add(new ExternalLogin(u1, "Google", sub));
            await db.SaveChangesAsync();
            return 0;
        });

        await Assert.ThrowsAsync<DbUpdateException>(() => factory.WithDbAsync(async db =>
        {
            db.ExternalLogins.Add(new ExternalLogin(u2, "Google", sub));
            await db.SaveChangesAsync();
            return 0;
        }));
    }

    // ---- 6. invalid / expired results ----------------------------------------------------------

    [Fact]
    public async Task InvalidGoogleResult_IsRejected_WithNoSession()
    {
        var result = await CallbackAsync(FakeGoogleIdentityProvider.InvalidCode);

        Assert.Equal("error", result.Query("status"));
        Assert.Equal("google_auth_failed", result.Query("error"));
        Assert.Null(result.RefreshCookie);
    }

    [Fact]
    public async Task Callback_WithMismatchedState_IsRejected()
    {
        var identity = Identity(UniqueEmail("csrf"));
        var code = factory.Google.IssueCodeFor(identity);

        var result = await CallbackAsync(code, stateOverride: "attacker-chosen-state");

        Assert.Equal("invalid_state", result.Query("error"));
        Assert.Null(result.RefreshCookie);
        Assert.False(await factory.WithDbAsync(db => db.Users.AnyAsync(u => u.Email == identity.Email)));
    }

    [Fact]
    public async Task Callback_WithoutStateCookie_IsRejected()
    {
        var identity = Identity(UniqueEmail("nocookie"));
        var code = factory.Google.IssueCodeFor(identity);

        var result = await CallbackAsync(code, sendStateCookie: false);

        Assert.Equal("invalid_state", result.Query("error"));
        Assert.False(await factory.WithDbAsync(db => db.Users.AnyAsync(u => u.Email == identity.Email)));
    }

    [Fact]
    public async Task Callback_WhenUserDeniesConsent_ReturnsAccessDenied()
    {
        var result = await CallbackAsync("x", query: "/api/auth/google/callback?error=access_denied");
        Assert.Equal("access_denied", result.Query("error"));
    }

    [Fact]
    public async Task LinkTicket_ThatIsTamperedOrAnAccessToken_IsRejected()
    {
        var email = UniqueEmail("ticket");
        await RegisterAsync(email);
        var ticket = (await SignInWithGoogleAsync(Identity(email))).Ticket!;
        var client = factory.CreateManualClient();

        var tampered = ticket[..^3] + (ticket.EndsWith("AAA") ? "BBB" : "AAA");
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = tampered, password = Password })).StatusCode);

        // A normal API access token must not be usable as a link ticket.
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        var accessToken = (await ReadJsonAsync(login)).GetProperty("accessToken").GetString();
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PostAsJsonAsync("/api/auth/google/link", new { ticket = accessToken, password = Password })).StatusCode);
    }

    [Fact]
    public void ExpiredLinkTicket_IsRejected()
    {
        var settings = Microsoft.Extensions.Options.Options.Create(new SecureBooking.Application.Features.Authentication.JwtSettings
        {
            Secret = "test-secret-test-secret-test-secret-1234567890",
            Issuer = "SecureBooking",
            Audience = "SecureBooking"
        });
        var tickets = new LinkTicketService(settings);
        var expired = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(
            new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                "SecureBooking", LinkTicketService.Audience,
                [new System.Security.Claims.Claim("sub", Guid.NewGuid().ToString())],
                notBefore: DateTime.UtcNow.AddMinutes(-20), expires: DateTime.UtcNow.AddMinutes(-10),
                signingCredentials: new Microsoft.IdentityModel.Tokens.SigningCredentials(
                    new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                        System.Text.Encoding.UTF8.GetBytes(settings.Value.Secret)),
                    Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256)));

        Assert.Throws<UnauthorizedAccessException>(() => tickets.Validate(expired));
    }

    // ---- 7. email/password still works ---------------------------------------------------------

    [Fact]
    public async Task EmailPasswordLogin_StillWorks()
    {
        var email = UniqueEmail("pw");
        await RegisterAsync(email);
        var client = factory.CreateManualClient();

        var ok = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.False(string.IsNullOrEmpty((await ReadJsonAsync(ok)).GetProperty("accessToken").GetString()));
        Assert.NotNull(CookieValue(ok, "refreshToken"));

        var bad = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "Nope-Nope1" });
        Assert.Equal(HttpStatusCode.Unauthorized, bad.StatusCode);
    }

    [Fact]
    public async Task GoogleOnlyCustomer_CannotLogInWithGuessedPassword()
    {
        var identity = Identity(UniqueEmail("gonly"));
        await SignInWithGoogleAsync(identity);

        var response = await factory.CreateManualClient()
            .PostAsJsonAsync("/api/auth/login", new { email = identity.Email, password = Password });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ---- profile page endpoints ----------------------------------------------------------------

    [Fact]
    public async Task Profile_CanBeReadUpdatedAndPasswordChanged_ByTheSignedInCustomer()
    {
        var email = UniqueEmail("profile");
        await RegisterAsync(email);
        var client = factory.CreateManualClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/users/me")).StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        var token = (await ReadJsonAsync(login)).GetProperty("accessToken").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var me = await ReadJsonAsync(await client.GetAsync("/api/users/me"));
        Assert.Equal(email, me.GetProperty("email").GetString());
        Assert.Equal("Rita Regular", me.GetProperty("fullName").GetString());

        var updated = await client.PutAsJsonAsync("/api/users/me", new { fullName = "Rita Q Regular", phone = "+1 555-123-4567" });
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        var json = await ReadJsonAsync(updated);
        Assert.Equal("Rita Q Regular", json.GetProperty("fullName").GetString());
        Assert.Equal("+1 555-123-4567", json.GetProperty("phone").GetString());

        // Wrong current password is a 400 (not 401, which would look like an expired session).
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/users/me/password",
            new { currentPassword = "Wrong-Password1", newPassword = "NewPassw0rd" })).StatusCode);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/users/me/password",
            new { currentPassword = Password, newPassword = "NewPassw0rd" })).StatusCode);

        var anon = factory.CreateManualClient();
        Assert.Equal(HttpStatusCode.OK,
            (await anon.PostAsJsonAsync("/api/auth/login", new { email, password = "NewPassw0rd" })).StatusCode);
    }

    // ---- 8. app token works on protected booking APIs ------------------------------------------

    [Fact]
    public async Task GoogleSession_CanAccessProtectedBookingApis()
    {
        var result = await SignInWithGoogleAsync(Identity(UniqueEmail("booker")));
        var (accessToken, _) = await RefreshAsync(result.RefreshCookie!);
        var client = factory.CreateManualClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/bookings/mine")).StatusCode);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/bookings/mine")).StatusCode);

        // Customers have no admin permissions, so admin-only endpoints stay closed.
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/bookings")).StatusCode);
    }
}
