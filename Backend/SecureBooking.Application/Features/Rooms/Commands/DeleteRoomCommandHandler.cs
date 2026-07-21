using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Rooms;

public sealed class DeleteRoomCommandHandler(
    IRepository<Room> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteRoomCommand, Unit>
{
    public async Task<Unit> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.Id);

        var hasBookings = await db.Bookings.AnyAsync(b => b.RoomId == request.Id, cancellationToken);
        if (hasBookings)
            throw new ConflictException("Cannot delete a room that still has bookings.");

        await repository.DeleteAsync(room, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
