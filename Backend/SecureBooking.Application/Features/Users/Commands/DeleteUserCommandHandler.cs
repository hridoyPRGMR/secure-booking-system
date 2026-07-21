using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users;

public sealed class DeleteUserCommandHandler(
    IRepository<User> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteUserCommand, Unit>
{
    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.Id);

        var hasBookings = await db.Bookings.AnyAsync(b => b.UserId == request.Id, cancellationToken);
        if (hasBookings)
            throw new ConflictException("Cannot delete a user that still has bookings.");

        await repository.DeleteAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
