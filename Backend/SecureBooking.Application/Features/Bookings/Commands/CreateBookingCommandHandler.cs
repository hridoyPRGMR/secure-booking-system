using MediatR;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Bookings;

public sealed class CreateBookingCommandHandler(
    IRepository<Booking> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateBookingCommand, BookingResponse>
{
    public async Task<BookingResponse> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = new Booking
        {
            UserId = request.UserId,
            RoomId = request.RoomId,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Status = request.Status,
            Notes = request.Notes,
        };

        await repository.AddAsync(booking, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await db.Users.FindAsync([request.UserId], cancellationToken)
            ?? throw new InvalidOperationException("User vanished after validation.");
        var room = await db.Rooms.FindAsync([request.RoomId], cancellationToken)
            ?? throw new InvalidOperationException("Room vanished after validation.");
        var hotel = await db.Hotels.FindAsync([room.HotelId], cancellationToken)
            ?? throw new InvalidOperationException("Hotel vanished after validation.");

        return new BookingResponse(
            booking.Id, booking.UserId, $"{user.FirstName} {user.LastName}", user.Email,
            booking.RoomId, room.Name, hotel.Name, booking.CheckIn, booking.CheckOut,
            booking.Status, booking.Notes, (booking.CheckOut - booking.CheckIn).Days * room.PricePerNight,
            booking.CreatedAt);
    }
}
