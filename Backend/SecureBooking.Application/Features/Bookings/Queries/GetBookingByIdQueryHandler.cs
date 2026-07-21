using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Bookings;

public sealed class GetBookingByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetBookingByIdQuery, BookingResponse>
{
    public async Task<BookingResponse> Handle(GetBookingByIdQuery request, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings
            .AsNoTracking()
            .Where(b => b.Id == request.Id)
            .Select(b => new BookingResponse(
                b.Id,
                b.UserId,
                b.User!.FirstName + " " + b.User.LastName,
                b.User.Email,
                b.RoomId,
                b.Room!.Name,
                b.Room.Hotel!.Name,
                b.CheckIn,
                b.CheckOut,
                b.Status,
                b.Notes,
                (decimal)(b.CheckOut - b.CheckIn).Days * b.Room.PricePerNight,
                b.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return booking ?? throw new NotFoundException(nameof(Booking), request.Id);
    }
}
