namespace SecureBooking.Domain.Entities;

/// <summary>
/// One-time password reset token. Only the SHA-256 hash is stored; the raw token exists only in the emailed link.
/// </summary>
public class PasswordResetToken : Entity
{
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }

    public User User { get; private set; } = default!;

    public bool IsUsable => UsedAt is null && DateTime.UtcNow < ExpiresAt;

    private PasswordResetToken() { }

    public PasswordResetToken(Guid userId, string tokenHash, DateTime expiresAt)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkUsed() => UsedAt = DateTime.UtcNow;
}
