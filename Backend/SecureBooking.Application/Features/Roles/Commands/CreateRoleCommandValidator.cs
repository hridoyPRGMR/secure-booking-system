using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Common.Security;

namespace SecureBooking.Application.Features.Roles;

public sealed class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name)
            .MustAsync(async (name, ct) => !await db.Roles.AnyAsync(r => r.Name == name, ct))
            .WithMessage("A role with this name already exists.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Description).MaximumLength(500);

        RuleForEach(x => x.PermissionCodes)
            .Must(code => PermissionCatalog.All.Any(p => p.Code == code))
            .WithMessage("'{PropertyValue}' is not a recognized permission code.");
    }
}
