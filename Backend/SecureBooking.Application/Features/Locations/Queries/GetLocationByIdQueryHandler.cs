using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Locations;

public sealed class GetLocationByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetLocationByIdQuery, LocationResponse>
{
    public async Task<LocationResponse> Handle(GetLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var location = await db.Locations
            .AsNoTracking()
            .Where(l => l.Id == request.Id)
            .Select(l => new LocationResponse(
                l.Id, l.City, l.Country, l.Address, l.Latitude, l.Longitude, l.Hotels.Count, l.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return location ?? throw new NotFoundException(nameof(Location), request.Id);
    }
}
