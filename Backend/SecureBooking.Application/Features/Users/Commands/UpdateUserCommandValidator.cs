using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Users;

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);

        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x)
            .MustAsync(async (cmd, ct) =>
                !await db.Users.AnyAsync(u => u.Email == cmd.Email.ToLower() && u.Id != cmd.Id, ct))
            .WithMessage("A user with this email already exists.")
            .WithName("Email")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
