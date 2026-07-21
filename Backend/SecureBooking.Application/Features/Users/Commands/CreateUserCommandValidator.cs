using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Users;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);

        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Email)
            .MustAsync(async (email, ct) => !await db.Users.AnyAsync(u => u.Email == email.ToLower(), ct))
            .WithMessage("A user with this email already exists.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
