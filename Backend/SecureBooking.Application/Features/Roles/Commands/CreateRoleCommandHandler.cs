using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Roles;

public sealed class CreateRoleCommandHandler(
    IRepository<Role> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateRoleCommand, RoleResponse>
{
    public async Task<RoleResponse> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = new Role(request.Name, request.Description);

        var permissions = await db.Permissions
            .Where(p => request.PermissionCodes.Contains(p.Code))
            .ToListAsync(cancellationToken);
        role.SetPermissions(permissions);

        await repository.AddAsync(role, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new RoleResponse(
            role.Id,
            role.Name,
            role.Description,
            role.Permissions.Select(p => p.Code).ToList(),
            0,
            role.CreatedAt);
    }
}
