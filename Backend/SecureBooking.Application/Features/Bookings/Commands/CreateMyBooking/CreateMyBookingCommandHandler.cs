using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Bookings.Commands.CreateBooking;
using SecureBooking.Domain.Entities;
using SecureBooking.Shared.Enums;
using SecureBooking.Application.Features.Bookings;
using Microsoft.EntityFrameworkCore;

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
            var room = await roomRepository.GetByIdAsync(request.RoomId, cancellationToken)
                ?? throw new NotFoundException("The selected room does not exist or is not available.", request.RoomId);

            if(room is null || !room.IsActive)
                throw new NotFoundException("The selected room does not exist or is not available.", request.RoomId);
            
            var hasOverlap = await db.Bookings.AnyAsync(b =>
                b.RoomId == request.RoomId &&
                b.Status != BookingStatus.Cancelled &&
                b.CheckIn < request.CheckOut &&
                request.CheckIn < b.CheckOut,
                cancellationToken);

            if (hasOverlap)
                throw new InvalidOperationException("This room is already booked for part of the selected date range.");

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
            
            // Make the room part of the optimistic concurrency check.
            room.UpdateVersion();

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
        catch (DbUpdateConcurrencyException)
        {
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw new InvalidOperationException("The room was modified by another user. Please refresh and try again.");
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
