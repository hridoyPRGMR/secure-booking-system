using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Authentication.Commands.GoogleLogin;

public sealed class GoogleLoginCommandHandler(
    IGoogleIdentityProvider google,
    IApplicationDbContext db,
    IUserRepository users,
    IRepository<ExternalLogin> externalLogins,
    IPasswordHasher passwordHasher,
    ILinkTicketService linkTickets,
    IUnitOfWork unitOfWork,
    AuthSessionIssuer sessionIssuer,
    ILogger<GoogleLoginCommandHandler> logger
    ) : IRequestHandler<GoogleLoginCommand, GoogleLoginResult>
{
    public async Task<GoogleLoginResult> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // Throws UnauthorizedAccessException if the code/ID token is invalid or expired.
        var identity = await google.ExchangeCodeAsync(
            request.Code, request.CodeVerifier, request.Nonce, cancellationToken);

        // 1. Known external identity? Match on the stable provider subject only, never on email.
        var existingLogin = await db.ExternalLogins
            .Include(l => l.User).ThenInclude(u => u.Roles).ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(
                l => l.Provider == identity.Provider && l.ProviderUserId == identity.ProviderUserId,
                cancellationToken);

        if (existingLogin is not null)
        {
            if (!existingLogin.User.IsActive)
                throw new UnauthorizedAccessException("This account is disabled.");

            logger.LogInformation("Google sign-in for existing user {UserId}.", existingLogin.UserId);
            return Authenticated(await sessionIssuer.IssueAsync(existingLogin.User, cancellationToken));
        }

        // 2. Unknown identity: an unverified email proves nothing, so neither link nor register on it.
        if (!identity.EmailVerified || string.IsNullOrWhiteSpace(identity.Email))
            throw new InvalidOperationException("Your Google account's email address is not verified.");

        var email = identity.Email.Trim().ToLowerInvariant();

        // 3. Email belongs to an existing account: require proof of ownership before linking.
        var existingUser = await users.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            logger.LogInformation("Google sign-in requires account linking for user {UserId}.", existingUser.Id);
            return new GoogleLoginResult(
                GoogleLoginStatus.LinkRequired, null, linkTickets.Create(existingUser.Id, identity), email);
        }

        // 4. Brand-new customer. The password is random and known to nobody: the account is Google-only.
        var (firstName, lastName) = ResolveNames(identity, email);
        var user = new User(
            firstName,
            lastName,
            email,
            passwordHasher.Hash(Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))))
        {
            ProfilePictureUrl = identity.PictureUrl
        };

        await users.AddAsync(user, cancellationToken);
        await externalLogins.AddAsync(
            new ExternalLogin(user.Id, identity.Provider, identity.ProviderUserId), cancellationToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            // A unique index (email or Provider+ProviderUserId) lost a race with a concurrent request.
            logger.LogWarning(ex, "Google sign-up conflicted with a concurrent request.");
            throw new ConflictException("Sign-in could not be completed. Please try again.");
        }

        logger.LogInformation("Created user {UserId} from Google sign-in.", user.Id);
        return Authenticated(await sessionIssuer.IssueAsync(user, cancellationToken));
    }

    private static GoogleLoginResult Authenticated(AuthResponse auth) =>
        new(GoogleLoginStatus.Authenticated, auth, null, null);

    private static (string First, string Last) ResolveNames(ExternalIdentity identity, string email)
    {
        var first = identity.FirstName?.Trim();
        var last = identity.LastName?.Trim();
        if (string.IsNullOrEmpty(first)) first = email.Split('@')[0];
        return (Truncate(first, 100), Truncate(string.IsNullOrEmpty(last) ? "-" : last, 100));
    }

    private static string Truncate(string value, int max) => value.Length <= max ? value : value[..max];
}
