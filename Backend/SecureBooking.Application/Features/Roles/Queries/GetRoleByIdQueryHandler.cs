using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Roles;

public sealed class GetRoleByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetRoleByIdQuery, RoleResponse>
{
    public async Task<RoleResponse> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await db.Roles
            .AsNoTracking()
            .Where(r => r.Id == request.Id)
            .Select(r => new RoleResponse(
                r.Id,
                r.Name,
                r.Description,
                r.Permissions.Select(p => p.Code).ToList(),
                db.Users.Count(u => u.Roles.Any(ur => ur.Id == r.Id)),
                r.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return role ?? throw new NotFoundException(nameof(Role), request.Id);
    }
}
