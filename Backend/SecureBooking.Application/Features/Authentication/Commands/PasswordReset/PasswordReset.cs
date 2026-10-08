using System.Net;
using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Authentication.Commands.PasswordReset;

public sealed record ForgotPasswordCommand(string Email) : IRequest<Unit>;

public sealed record ResetPasswordCommand(string Token, string NewPassword) : IRequest<Unit>;

internal static class ResetTokenHash
{
    public static string Of(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

public sealed class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator() => RuleFor(x => x.Email).NotEmpty().EmailAddress();
}

/// <summary>
/// Always completes silently: whether or not the email belongs to an account, the caller sees the same
/// result, so the endpoint cannot be used to discover which emails are registered.
/// </summary>
public sealed class ForgotPasswordCommandHandler(
    IApplicationDbContext db,
    IRepository<PasswordResetToken> tokens,
    IUnitOfWork unitOfWork,
    IEmailSender emailSender,
    IOptions<EmailSettings> emailSettings,
    ILogger<ForgotPasswordCommandHandler> logger
    ) : IRequestHandler<ForgotPasswordCommand, Unit>
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(1);
    private static readonly TimeSpan MinInterval = TimeSpan.FromSeconds(60);

    public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is null || !user.IsActive)
        {
            logger.LogInformation("Password reset requested for an unknown or inactive account.");
            return Unit.Value;
        }

        // Per-account throttle so the endpoint can't be used to mail-bomb someone.
        var since = DateTime.UtcNow - MinInterval;
        if (await db.PasswordResetTokens.AnyAsync(t => t.UserId == user.Id && t.CreatedAt > since, ct))
        {
            logger.LogInformation("Password reset throttled for user {UserId}.", user.Id);
            return Unit.Value;
        }

        // Only the newest link works.
        var open = await db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null)
            .ToListAsync(ct);
        foreach (var old in open) old.MarkUsed();

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');

        await tokens.AddAsync(
            new PasswordResetToken(user.Id, ResetTokenHash.Of(rawToken), DateTime.UtcNow.Add(Lifetime)), ct);
        await unitOfWork.SaveChangesAsync(ct);

        // The token travels in the URL fragment so it stays out of server logs and Referer headers.
        var link = $"{emailSettings.Value.FrontendBaseUrl.TrimEnd('/')}/reset-password#token={rawToken}";
        var name = WebUtility.HtmlEncode(user.FirstName);

        try
        {
            await emailSender.SendAsync(
                user.Email,
                "Reset your SecureBooking password",
                $"""
                <p>Hi {name},</p>
                <p>We received a request to reset your password. Click the link below to choose a new one.
                The link works once and expires in 1 hour.</p>
                <p><a href="{link}">Reset your password</a></p>
                <p>If you didn't ask for this, you can ignore this email; your password won't change.</p>
                """,
                ct);
        }
        catch (Exception ex)
        {
            // Don't reveal delivery problems to the (possibly unauthenticated) caller.
            logger.LogError(ex, "Failed to send password reset email for user {UserId}.", user.Id);
        }

        return Unit.Value;
    }
}

public sealed class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain one number.");
    }
}

public sealed class ResetPasswordCommandHandler(
    IApplicationDbContext db,
    IPasswordHasher hasher,
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork unitOfWork,
    ILogger<ResetPasswordCommandHandler> logger
    ) : IRequestHandler<ResetPasswordCommand, Unit>
{
    public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken ct)
    {
        var hash = ResetTokenHash.Of(request.Token);
        var token = await db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

        if (token is null || !token.IsUsable || !token.User.IsActive)
            throw new InvalidOperationException("This password reset link is invalid or has expired.");

        token.User.ChangePassword(hasher.Hash(request.NewPassword));
        token.MarkUsed();

        // Anyone holding an old session (including an attacker who knew the old password) is signed out.
        await refreshTokens.RevokeAllForUserAsync(token.UserId, ct);

        await unitOfWork.SaveChangesAsync(ct);
        logger.LogInformation("Password reset completed for user {UserId}.", token.UserId);
        return Unit.Value;
    }
}
