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
            .OrderBy(l => l.City)
            .Take(request.Limit)
            .Select(l => new SearchLocationsResponse(
                l.Id,
                string.IsNullOrEmpty(l.Address)
                    ? $"{l.City}, {l.Country}"
                    : $"{l.Address}, {l.City}, {l.Country}"
            ))
            .ToListAsync(cancellationToken);
    }
}