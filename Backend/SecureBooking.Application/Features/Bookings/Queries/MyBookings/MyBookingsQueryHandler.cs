using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Queries.MyBookings;

public sealed class MyBookingsQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    : IRequestHandler<MyBookingsQuery, PagedResult<BookingResponse>>
{
    public async Task<PagedResult<BookingResponse>> Handle(MyBookingsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        var query = db.Bookings.AsNoTracking().Where(b => b.UserId == userId);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status);

        query = query.OrderByDescending(b => b.CheckIn);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
            .ToListAsync(cancellationToken);

        return new PagedResult<BookingResponse>(items, request.Page, request.PageSize, total);
    }
}
