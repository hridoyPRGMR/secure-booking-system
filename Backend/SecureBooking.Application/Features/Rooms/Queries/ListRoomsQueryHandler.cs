using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Rooms.DTOs;

namespace SecureBooking.Application.Features.Rooms.Queries;

public sealed class ListRoomsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListRoomsQuery, PagedResult<RoomResponse>>
{
    public async Task<PagedResult<RoomResponse>> Handle(ListRoomsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Rooms.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(r => r.Name.ToLower().Contains(term));
        }

        if (request.HotelId.HasValue)
            query = query.Where(r => r.HotelId == request.HotelId);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(r => r.Hotel!.Location!.City == request.City);

        if (!string.IsNullOrWhiteSpace(request.Country))
            query = query.Where(r => r.Hotel!.Location!.Country == request.Country);

        if (request.Type.HasValue)
            query = query.Where(r => r.Type == request.Type);

        if (request.CheckIn.HasValue && request.CheckOut.HasValue)
        {
            var checkIn = DateTime.SpecifyKind(request.CheckIn.Value, DateTimeKind.Utc);
            var checkOut = DateTime.SpecifyKind(request.CheckOut.Value, DateTimeKind.Utc);

            query = query.Where(r => !r.Bookings.Any(b =>
                b.Status != Shared.Enums.BookingStatus.Cancelled &&
                b.CheckIn < checkOut &&
                checkIn < b.CheckOut));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "priceperright" or "priceppernight" => request.SortDescending ? query.OrderByDescending(r => r.PricePerNight) : query.OrderBy(r => r.PricePerNight),
            "capacity" => request.SortDescending ? query.OrderByDescending(r => r.Capacity) : query.OrderBy(r => r.Capacity),
            "createdat" => request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new RoomResponse(
                r.Id, r.Name, r.Type, r.Description, r.Capacity, r.PricePerNight, r.ImageUrl, r.IsActive,
                r.HotelId, r.Hotel!.Name, r.Bookings.Count, r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<RoomResponse>(items, request.Page, request.PageSize, total);
    }
}
