using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Roles;

public sealed class UpdateRoleCommandHandler(
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateRoleCommand, RoleResponse>
{
    public async Task<RoleResponse> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await db.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Role), request.Id);

        role.UpdateDetails(request.Name, request.Description);

        var permissions = await db.Permissions
            .Where(p => request.PermissionCodes.Contains(p.Code))
            .ToListAsync(cancellationToken);
        role.SetPermissions(permissions);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var userCount = await db.Users.CountAsync(u => u.Roles.Any(r => r.Id == role.Id), cancellationToken);

        return new RoleResponse(
            role.Id,
            role.Name,
            role.Description,
            role.Permissions.Select(p => p.Code).ToList(),
            userCount,
            role.CreatedAt);
    }
}
