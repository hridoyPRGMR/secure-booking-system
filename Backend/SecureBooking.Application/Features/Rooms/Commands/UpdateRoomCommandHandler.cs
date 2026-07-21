using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Rooms;

public sealed class UpdateRoomCommandHandler(
    IRepository<Room> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateRoomCommand, RoomResponse>
{
    public async Task<RoomResponse> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.Id);

        room.Name = request.Name;
        room.Type = request.Type;
        room.Description = request.Description;
        room.Capacity = request.Capacity;
        room.PricePerNight = request.PricePerNight;
        room.ImageUrl = request.ImageUrl;
        room.IsActive = request.IsActive;
        room.HotelId = request.HotelId;

        await repository.UpdateAsync(room, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var hotel = await db.Hotels.FindAsync([request.HotelId], cancellationToken)
            ?? throw new InvalidOperationException("Hotel vanished after validation.");
        var bookingCount = await db.Bookings.CountAsync(b => b.RoomId == room.Id, cancellationToken);

        return new RoomResponse(
            room.Id, room.Name, room.Type, room.Description, room.Capacity, room.PricePerNight,
            room.ImageUrl, room.IsActive, room.HotelId, hotel.Name, bookingCount, room.CreatedAt);
    }
}
