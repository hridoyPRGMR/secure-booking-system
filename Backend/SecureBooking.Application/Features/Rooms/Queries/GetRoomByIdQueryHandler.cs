using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Rooms;

public sealed class GetRoomByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetRoomByIdQuery, RoomResponse>
{
    public async Task<RoomResponse> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var room = await db.Rooms
            .AsNoTracking()
            .Where(r => r.Id == request.Id)
            .Select(r => new RoomResponse(
                r.Id, r.Name, r.Type, r.Description, r.Capacity, r.PricePerNight, r.ImageUrl, r.IsActive,
                r.HotelId, r.Hotel!.Name, r.Bookings.Count, r.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return room ?? throw new NotFoundException(nameof(Room), request.Id);
    }
}
