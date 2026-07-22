using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Roles;

public sealed class DeleteRoleCommandHandler(
    IRepository<Role> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteRoleCommand, Unit>
{
    public async Task<Unit> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Role), request.Id);

        var userCount = await db.Users.CountAsync(u => u.Roles.Any(r => r.Id == request.Id), cancellationToken);
        if (userCount > 0)
            throw new ConflictException("Cannot delete a role that is still assigned to users.");

        await repository.DeleteAsync(role, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
