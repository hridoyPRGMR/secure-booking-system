using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Locations.DTOs;

namespace SecureBooking.Application.Features.Locations.Queries;

public sealed class SearchLocationsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<SearchLocationsQuery, List<SearchLocationsResponse>>
{
    public async Task<List<SearchLocationsResponse>> Handle(SearchLocationsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Search))
            return [];

        var searchTerm = request.Search.Trim();
        var pattern = $"%{searchTerm}%";

        return await db.Locations
            .AsNoTracking()
            .Where(l =>
                EF.Functions.ILike(l.City, pattern) ||
                EF.Functions.ILike(l.Country, pattern) ||
                EF.Functions.ILike(l.Address, pattern))
            .Select(l => new { l.City, l.Country })
            .Distinct()
            .OrderBy(l => l.City)
            .Take(request.Limit)
            .Select(l => new SearchLocationsResponse(l.City, l.Country, $"{l.City}, {l.Country}"))
            .ToListAsync(cancellationToken);
    }
}