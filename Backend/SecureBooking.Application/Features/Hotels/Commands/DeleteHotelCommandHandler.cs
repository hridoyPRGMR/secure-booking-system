using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Hotels;

public sealed class DeleteHotelCommandHandler(
    IRepository<Hotel> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteHotelCommand, Unit>
{
    public async Task<Unit> Handle(DeleteHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Hotel), request.Id);

        var hasRooms = await db.Rooms.AnyAsync(r => r.HotelId == request.Id, cancellationToken);
        if (hasRooms)
            throw new ConflictException("Cannot delete a hotel that still has rooms assigned to it.");

        await repository.DeleteAsync(hotel, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
