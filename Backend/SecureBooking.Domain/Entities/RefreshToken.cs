namespace SecureBooking.Domain.Entities;

public class RefreshToken : Entity
{
    public Guid UserId { get; private set; }

    public string TokenHash { get; private set; }

    public DateTime ExpiresAt { get; private set; }

    public DateTime? RevokedAt { get; private set; }

    public string? ReplacedByTokenHash { get; private set; }

    public User User { get; private set; } = default!;

    public bool IsExpired =>
        DateTime.UtcNow >= ExpiresAt;

    public bool IsRevoked =>
        RevokedAt is not null;

    public bool IsActive =>
        !IsExpired && !IsRevoked;

    private RefreshToken(){}

    public RefreshToken(
        Guid userId,
        string tokenHash,
        DateTime expiresAt)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
    }

    public void Revoke(string? replacedByHash = null)
    {
        RevokedAt = DateTime.UtcNow;
        ReplacedByTokenHash = replacedByHash;
    }
}