using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Bookings.Commands.CreateBooking;
using SecureBooking.Domain.Entities;
using SecureBooking.Shared.Enums;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Commands.CreateMyBooking;

public sealed class CreateMyBookingCommandHandler(
    IRepository<Booking> repository,
    IRoomRepository roomRepository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser
) : IRequestHandler<CreateMyBookingCommand, BookingResponse>
{
    public async Task<BookingResponse> Handle(CreateMyBookingCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // Blocks any other transaction trying to book this room until we commit/rollback,
            // closing the check-then-insert race that the validator's overlap check alone can't.
            var room = await roomRepository.LockForUpdateAsync(request.RoomId, cancellationToken)
                ?? throw new NotFoundException(nameof(Room), request.RoomId);

            // Task.Delay(30000, cancellationToken).Wait(cancellationToken); // Simulate a long-running operation to test the lock

            if (await CreateBookingCommandValidator.HasOverlapAsync(db, request.RoomId, request.CheckIn, request.CheckOut, null, cancellationToken))
                throw new ConflictException("This room is already booked for part of the selected date range.");

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
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            var user = await db.Users.FindAsync([userId], cancellationToken)
                ?? throw new InvalidOperationException("User vanished after validation.");
            var hotel = await db.Hotels.FindAsync([room.HotelId], cancellationToken)
                ?? throw new InvalidOperationException("Hotel vanished after validation.");

            return new BookingResponse(
                booking.Id, booking.UserId, $"{user.FirstName} {user.LastName}", user.Email,
                booking.RoomId, room.Name, hotel.Name, booking.CheckIn, booking.CheckOut,
                booking.Status, booking.Notes, (decimal)(booking.CheckOut - booking.CheckIn).Days * room.PricePerNight,
                booking.CreatedAt);
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
