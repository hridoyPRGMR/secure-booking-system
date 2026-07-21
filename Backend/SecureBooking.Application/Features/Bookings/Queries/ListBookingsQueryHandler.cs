using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Bookings;

public sealed class ListBookingsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListBookingsQuery, PagedResult<BookingResponse>>
{
    public async Task<PagedResult<BookingResponse>> Handle(ListBookingsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Bookings.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(b =>
                b.User!.FirstName.ToLower().Contains(term) ||
                b.User.LastName.ToLower().Contains(term) ||
                b.User.Email.ToLower().Contains(term) ||
                b.Room!.Name.ToLower().Contains(term));
        }

        if (request.UserId.HasValue)
            query = query.Where(b => b.UserId == request.UserId);

        if (request.RoomId.HasValue)
            query = query.Where(b => b.RoomId == request.RoomId);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status);

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "checkin" => request.SortDescending ? query.OrderByDescending(b => b.CheckIn) : query.OrderBy(b => b.CheckIn),
            "checkout" => request.SortDescending ? query.OrderByDescending(b => b.CheckOut) : query.OrderBy(b => b.CheckOut),
            "status" => request.SortDescending ? query.OrderByDescending(b => b.Status) : query.OrderBy(b => b.Status),
            _ => request.SortDescending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt),
        };

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
