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
            query = query.Where(h => h.Name.ToLower().Contains(term) ||
                                     (h.Location != null && (h.Location.City.ToLower().Contains(term) ||
                                                             h.Location.Country.ToLower().Contains(term))));
        }

        if (request.LocationId.HasValue)
            query = query.Where(h => h.LocationId == request.LocationId);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(h => h.Location!.City == request.City);

        if (!string.IsNullOrWhiteSpace(request.Country))
            query = query.Where(h => h.Location!.Country == request.Country);

        if (request.IsActive.HasValue)
            query = query.Where(h => h.IsActive == request.IsActive);

        if (request.StarRatings is { Count: > 0 })
            query = query.Where(h => request.StarRatings.Contains(h.StarRating));

        if (request.ReviewScoreMin.HasValue)
            query = query.Where(h => h.ReviewScore >= request.ReviewScoreMin);

        if (request.PropertyTypes is { Count: > 0 })
            query = query.Where(h => request.PropertyTypes.Contains(h.PropertyType));

        if (request.Amenities is { Count: > 0 })
        {
            foreach (var amenity in request.Amenities)
            {
                var selected = amenity;
                query = query.Where(h => h.Amenities.Contains(selected));
            }
        }

        if (request.MinPrice.HasValue)
        {
            var min = request.MinPrice.Value;
            query = query.Where(h => h.Rooms.Where(r => r.IsActive).Select(r => (decimal?)r.PricePerNight).Min() >= min);
        }

        if (request.MaxPrice.HasValue)
        {
            var max = request.MaxPrice.Value;
            query = query.Where(h => h.Rooms.Where(r => r.IsActive).Select(r => (decimal?)r.PricePerNight).Min() <= max);
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "starrating" => request.SortDescending ? query.OrderByDescending(h => h.StarRating) : query.OrderBy(h => h.StarRating),
            "review" => request.SortDescending ? query.OrderByDescending(h => h.ReviewScore) : query.OrderBy(h => h.ReviewScore),
            "price" => request.SortDescending ? query.OrderByDescending(h => h.Rooms.Where(r => r.IsActive).Select(r => (decimal?)r.PricePerNight).Min()) : query.OrderBy(h => h.Rooms.Where(r => r.IsActive).Select(r => (decimal?)r.PricePerNight).Min()),
            "createdat" => request.SortDescending ? query.OrderByDescending(h => h.CreatedAt) : query.OrderBy(h => h.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(h => h.Name) : query.OrderBy(h => h.Name),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(h => new HotelResponse(
                h.Id, h.Name, h.Description, h.StarRating, h.ReviewScore, h.PropertyType,
                h.Amenities.ToList(), h.ImageUrl, h.IsActive,
                h.LocationId, h.Location!.City, h.Location.Country, h.Rooms.Count,
                h.Rooms.Where(r => r.IsActive).Select(r => (decimal?)r.PricePerNight).Min(),
                h.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<HotelResponse>(items, request.Page, request.PageSize, total);
    }
}
