using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Hotels;

public sealed class ListHotelsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListHotelsQuery, PagedResult<HotelResponse>>
{
    public async Task<PagedResult<HotelResponse>> Handle(ListHotelsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Hotels.AsNoTracking().AsQueryable();

        if (request.CheckIn.HasValue && request.CheckOut.HasValue)
        {
            var checkIn = request.CheckIn.Value;
            var checkOut = request.CheckOut.Value;

            query = query.Where(h => h.Rooms.Any(r => r.IsActive &&
                !r.Bookings.Any(b =>
                    b.Status != BookingStatus.Cancelled &&
                    b.CheckIn < checkOut &&
                    b.CheckOut > checkIn)));
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
            query = query.Where(h => h.Rooms.Where(r => r.IsActive).Min(r => (decimal?)r.PricePerNight) >= min);
        }

        if (request.MaxPrice.HasValue)
        {
            var max = request.MaxPrice.Value;
            query = query.Where(h => h.Rooms.Where(r => r.IsActive).Min(r => (decimal?)r.PricePerNight) <= max);
        }

        if (request.Adults.HasValue || request.Children.HasValue || request.Rooms.HasValue)
        {
            var guests = (request.Adults ?? 0) + (request.Children ?? 0);
            var roomsNeeded = Math.Max(request.Rooms ?? 1, 1);

            query = query.Where(h =>
                h.Rooms.Count(r => r.IsActive) >= roomsNeeded &&
                h.Rooms.Where(r => r.IsActive).Sum(r => (int?)r.Capacity) >= guests);
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "starrating" => request.SortDescending ? query.OrderByDescending(h => h.StarRating) : query.OrderBy(h => h.StarRating),
            "review" => request.SortDescending ? query.OrderByDescending(h => h.ReviewScore) : query.OrderBy(h => h.ReviewScore),
            "price" => request.SortDescending
                ? query.OrderByDescending(h => h.Rooms.Where(r => r.IsActive).Min(r => (decimal?)r.PricePerNight))
                : query.OrderBy(h => h.Rooms.Where(r => r.IsActive).Min(r => (decimal?)r.PricePerNight)),
            "createdat" => request.SortDescending ? query.OrderByDescending(h => h.CreatedAt) : query.OrderBy(h => h.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(h => h.Name) : query.OrderBy(h => h.Name),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(h => new HotelResponse(
                h.Id,
                h.Name,
                h.Description,
                h.StarRating,
                h.ReviewScore,
                h.PropertyType,
                h.Amenities.ToList(),
                h.ImageUrl,
                h.IsActive,
                h.LocationId,
                h.Location!.City,
                h.Location.Country,
                h.Rooms.Count,
                h.Rooms.Count(r => r.IsActive &&
                    (!request.CheckIn.HasValue || !request.CheckOut.HasValue ||
                    !r.Bookings.Any(b =>
                        b.Status != BookingStatus.Cancelled &&
                        b.CheckIn < request.CheckOut.Value &&
                        b.CheckOut > request.CheckIn.Value))),
                h.Rooms.Where(r => r.IsActive).Min(r => (decimal?)r.PricePerNight),
                h.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<HotelResponse>(items, request.Page, request.PageSize, total);
    }
}
