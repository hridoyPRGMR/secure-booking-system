using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Common.Security;

namespace SecureBooking.Application.Features.Roles;

public sealed class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
{
    public UpdateRoleCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x)
            .MustAsync(async (cmd, ct) =>
                !await db.Roles.AnyAsync(r => r.Name == cmd.Name && r.Id != cmd.Id, ct))
            .WithMessage("A role with this name already exists.")
            .WithName("Name")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Description).MaximumLength(500);

        RuleForEach(x => x.PermissionCodes)
            .Must(code => PermissionCatalog.All.Any(p => p.Code == code))
            .WithMessage("'{PropertyValue}' is not a recognized permission code.");
    }
}
