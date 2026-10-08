using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Authentication.Commands.LinkGoogleAccount;

public sealed class LinkGoogleAccountCommandHandler(
    IApplicationDbContext db,
    IRepository<ExternalLogin> externalLogins,
    IPasswordHasher passwordHasher,
    ILinkTicketService linkTickets,
    IUnitOfWork unitOfWork,
    AuthSessionIssuer sessionIssuer,
    ILogger<LinkGoogleAccountCommandHandler> logger
    ) : IRequestHandler<LinkGoogleAccountCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LinkGoogleAccountCommand request, CancellationToken cancellationToken)
    {
        var ticket = linkTickets.Validate(request.Ticket);
        var identity = ticket.Identity;

        var user = await db.Users
            .Include(u => u.Roles).ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Id == ticket.UserId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired link request.");

        // The ticket was minted for this exact verified email; refuse if the account changed since.
        if (!user.IsActive ||
            !string.Equals(user.Email, identity.Email, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Invalid or expired link request.");

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            logger.LogWarning("Google link confirmation failed for user {UserId}: wrong password.", user.Id);
            throw new UnauthorizedAccessException("Incorrect password.");
        }

        var alreadyLinked = await db.ExternalLogins.AnyAsync(
            l => l.Provider == identity.Provider && l.ProviderUserId == identity.ProviderUserId,
            cancellationToken);
        if (alreadyLinked)
            throw new ConflictException("This Google account is already linked to a customer.");

        await externalLogins.AddAsync(
            new ExternalLogin(user.Id, identity.Provider, identity.ProviderUserId), cancellationToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            logger.LogWarning(ex, "Linking conflicted with the unique (Provider, ProviderUserId) index.");
            throw new ConflictException("This Google account is already linked to a customer.");
        }

        logger.LogInformation("Linked {Provider} identity to user {UserId}.", identity.Provider, user.Id);
        return await sessionIssuer.IssueAsync(user, cancellationToken);
    }
}
