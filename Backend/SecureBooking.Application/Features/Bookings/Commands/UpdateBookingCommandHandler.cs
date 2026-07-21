using MediatR;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Bookings;

public sealed class UpdateBookingCommandHandler(
    IRepository<Booking> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateBookingCommand, BookingResponse>
{
    public async Task<BookingResponse> Handle(UpdateBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.Id);

        booking.UserId = request.UserId;
        booking.RoomId = request.RoomId;
        booking.CheckIn = request.CheckIn;
        booking.CheckOut = request.CheckOut;
        booking.Status = request.Status;
        booking.Notes = request.Notes;

        await repository.UpdateAsync(booking, cancellationToken);
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
