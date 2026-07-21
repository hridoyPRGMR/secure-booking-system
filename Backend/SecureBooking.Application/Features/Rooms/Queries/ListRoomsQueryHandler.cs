using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Rooms;

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

        if (request.Type.HasValue)
            query = query.Where(r => r.Type == request.Type);

        if (request.IsActive.HasValue)
            query = query.Where(r => r.IsActive == request.IsActive);

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
