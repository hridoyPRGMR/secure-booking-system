using MediatR;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Rooms;

public sealed class CreateRoomCommandHandler(
    IRepository<Room> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateRoomCommand, RoomResponse>
{
    public async Task<RoomResponse> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = new Room
        {
            Name = request.Name,
            Type = request.Type,
            Description = request.Description,
            Capacity = request.Capacity,
            PricePerNight = request.PricePerNight,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            HotelId = request.HotelId,
        };

        await repository.AddAsync(room, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var hotel = await db.Hotels.FindAsync([request.HotelId], cancellationToken)
            ?? throw new InvalidOperationException("Hotel vanished after validation.");

        return new RoomResponse(
            room.Id, room.Name, room.Type, room.Description, room.Capacity, room.PricePerNight,
            room.ImageUrl, room.IsActive, room.HotelId, hotel.Name, 0, room.CreatedAt);
    }
}
