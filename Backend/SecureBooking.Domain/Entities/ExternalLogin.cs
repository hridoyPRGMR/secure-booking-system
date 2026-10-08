namespace SecureBooking.Domain.Entities;

/// <summary>
/// Links a <see cref="User"/> (customer account) to an identity at an external provider.
/// (Provider, ProviderUserId) is globally unique, so one external identity can only ever
/// belong to a single user, while one user may hold several external identities.
/// </summary>
public class ExternalLogin : Entity
{
    public const string GoogleProvider = "Google";

    public Guid UserId { get; private set; }

    /// <summary>Provider name, e.g. "Google".</summary>
    public string Provider { get; private set; } = string.Empty;

    /// <summary>Stable, provider-issued subject identifier (Google "sub" claim). Never an email address.</summary>
    public string ProviderUserId { get; private set; } = string.Empty;

    public User User { get; private set; } = default!;

    private ExternalLogin() { }

    public ExternalLogin(Guid userId, string provider, string providerUserId)
    {
        UserId = userId;
        Provider = provider;
        ProviderUserId = providerUserId;
        CreatedAt = DateTime.UtcNow;
    }
}
