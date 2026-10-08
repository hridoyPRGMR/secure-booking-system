using FluentValidation;
using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users.Profile;

/// <summary>Self-service profile for the signed-in customer. All handlers act only on the caller's own account.</summary>
public sealed record ProfileResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? Phone,
    string? AvatarUrl);

public sealed record GetMyProfileQuery : IRequest<ProfileResponse>;

public sealed record UpdateMyProfileCommand(string FullName, string? Phone) : IRequest<ProfileResponse>;

public sealed record ChangeMyPasswordCommand(string CurrentPassword, string NewPassword) : IRequest<Unit>;

internal static class ProfileMapping
{
    public static ProfileResponse ToResponse(User u) => new(
        u.Id, u.FirstName, u.LastName, u.FullName.Trim(), u.Email, u.PhoneNumber, u.ProfilePictureUrl);

    public static async Task<User> LoadCurrentAsync(
        ICurrentUser currentUser, IUserRepository users, CancellationToken ct)
    {
        var id = currentUser.UserId ?? throw new UnauthorizedAccessException("No authenticated user.");
        return await users.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(User), id);
    }
}

public sealed class GetMyProfileQueryHandler(ICurrentUser currentUser, IUserRepository users)
    : IRequestHandler<GetMyProfileQuery, ProfileResponse>
{
    public async Task<ProfileResponse> Handle(GetMyProfileQuery request, CancellationToken ct) =>
        ProfileMapping.ToResponse(await ProfileMapping.LoadCurrentAsync(currentUser, users, ct));
}

public sealed class UpdateMyProfileCommandValidator : AbstractValidator<UpdateMyProfileCommand>
{
    public UpdateMyProfileCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(30)
            .Matches(@"^[+\d][\d\s-]{6,}$").When(x => !string.IsNullOrWhiteSpace(x.Phone))
            .WithMessage("Enter a valid phone number.");
    }
}

public sealed class UpdateMyProfileCommandHandler(
    ICurrentUser currentUser, IUserRepository users, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateMyProfileCommand, ProfileResponse>
{
    public async Task<ProfileResponse> Handle(UpdateMyProfileCommand request, CancellationToken ct)
    {
        var user = await ProfileMapping.LoadCurrentAsync(currentUser, users, ct);

        // The account stores first/last name separately: first word is the first name, the rest the last.
        var parts = request.FullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        user.FirstName = parts[0];
        user.LastName = parts.Length > 1 ? parts[1].Trim() : "-";
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();

        await unitOfWork.SaveChangesAsync(ct);
        return ProfileMapping.ToResponse(user);
    }
}

public sealed class ChangeMyPasswordCommandValidator : AbstractValidator<ChangeMyPasswordCommand>
{
    public ChangeMyPasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain one number.");
    }
}

public sealed class ChangeMyPasswordCommandHandler(
    ICurrentUser currentUser, IUserRepository users, IPasswordHasher hasher, IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeMyPasswordCommand, Unit>
{
    public async Task<Unit> Handle(ChangeMyPasswordCommand request, CancellationToken ct)
    {
        var user = await ProfileMapping.LoadCurrentAsync(currentUser, users, ct);

        // A wrong current password is a 400, not a 401, so the client doesn't treat it as an expired session.
        if (!hasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect.");

        user.ChangePassword(hasher.Hash(request.NewPassword));
        await unitOfWork.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
