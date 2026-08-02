using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed class CreateMyBookingCommandHandler(
    IRepository<Booking> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser
) : IRequestHandler<CreateMyBookingCommand, BookingResponse>
{
    public async Task<BookingResponse> Handle(CreateMyBookingCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        var booking = new Booking
        {
            UserId = userId,
            RoomId = request.RoomId,
            CheckIn = DateTime.SpecifyKind(request.CheckIn, DateTimeKind.Utc),
            CheckOut = DateTime.SpecifyKind(request.CheckOut, DateTimeKind.Utc),
            Status = BookingStatus.Pending,
            Notes = request.Notes,
        };

        await repository.AddAsync(booking, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new InvalidOperationException("User vanished after validation.");
        var room = await db.Rooms.FindAsync([request.RoomId], cancellationToken)
            ?? throw new InvalidOperationException("Room vanished after validation.");
        var hotel = await db.Hotels.FindAsync([room.HotelId], cancellationToken)
            ?? throw new InvalidOperationException("Hotel vanished after validation.");

        return new BookingResponse(
            booking.Id, booking.UserId, $"{user.FirstName} {user.LastName}", user.Email,
            booking.RoomId, room.Name, hotel.Name, booking.CheckIn, booking.CheckOut,
            booking.Status, booking.Notes, (decimal)(booking.CheckOut - booking.CheckIn).Days * room.PricePerNight,
            booking.CreatedAt);
    }
}
