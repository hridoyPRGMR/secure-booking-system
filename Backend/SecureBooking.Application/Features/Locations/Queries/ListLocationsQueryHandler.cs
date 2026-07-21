using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Locations;

public sealed class ListLocationsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListLocationsQuery, PagedResult<LocationResponse>>
{
    public async Task<PagedResult<LocationResponse>> Handle(ListLocationsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Locations.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(l =>
                l.City.ToLower().Contains(term) ||
                l.Country.ToLower().Contains(term) ||
                l.Address.ToLower().Contains(term));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "country" => request.SortDescending ? query.OrderByDescending(l => l.Country) : query.OrderBy(l => l.Country),
            "createdat" => request.SortDescending ? query.OrderByDescending(l => l.CreatedAt) : query.OrderBy(l => l.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(l => l.City) : query.OrderBy(l => l.City),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(l => new LocationResponse(
                l.Id,
                l.City,
                l.Country,
                l.Address,
                l.Latitude,
                l.Longitude,
                l.Hotels.Count,
                l.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<LocationResponse>(items, request.Page, request.PageSize, total);
    }
}
