using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Hotels;

public sealed class ListHotelsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListHotelsQuery, PagedResult<HotelResponse>>
{
    public async Task<PagedResult<HotelResponse>> Handle(ListHotelsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Hotels.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(h => h.Name.ToLower().Contains(term));
        }

        if (request.LocationId.HasValue)
            query = query.Where(h => h.LocationId == request.LocationId);

        if (request.IsActive.HasValue)
            query = query.Where(h => h.IsActive == request.IsActive);

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "starrating" => request.SortDescending ? query.OrderByDescending(h => h.StarRating) : query.OrderBy(h => h.StarRating),
            "createdat" => request.SortDescending ? query.OrderByDescending(h => h.CreatedAt) : query.OrderBy(h => h.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(h => h.Name) : query.OrderBy(h => h.Name),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(h => new HotelResponse(
                h.Id, h.Name, h.Description, h.StarRating, h.ImageUrl, h.IsActive,
                h.LocationId, h.Location!.City, h.Location.Country, h.Rooms.Count, h.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<HotelResponse>(items, request.Page, request.PageSize, total);
    }
}
