using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users;

public sealed class UpdateUserCommandHandler(
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateUserCommand, UserResponse>
{
    public async Task<UserResponse> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.Id);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email.ToLowerInvariant();

        var roles = await db.Roles
            .Where(r => request.RoleIds.Contains(r.Id))
            .ToListAsync(cancellationToken);
        user.SetRoles(roles);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var roleSummaries = user.Roles.Select(r => new RoleSummary(r.Id, r.Name)).ToList();
        return new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.IsActive, user.CreatedAt, roleSummaries);
    }
}
