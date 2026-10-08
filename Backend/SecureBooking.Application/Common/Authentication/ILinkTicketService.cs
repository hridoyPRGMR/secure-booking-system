namespace SecureBooking.Application.Common.Authentication;

public sealed record LinkTicket(Guid UserId, ExternalIdentity Identity);

/// <summary>
/// Issues and validates short-lived, signed tickets that carry a verified external identity between
/// "Google says this is you" and "you proved you own the existing account".
/// </summary>
public interface ILinkTicketService
{
    string Create(Guid userId, ExternalIdentity identity);

    /// <summary>Throws <see cref="UnauthorizedAccessException"/> for tampered or expired tickets.</summary>
    LinkTicket Validate(string ticket);
}
