using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Locations;

public sealed class UpdateLocationCommandHandler(
    IRepository<Location> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateLocationCommand, LocationResponse>
{
    public async Task<LocationResponse> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Location), request.Id);

        location.City = request.City;
        location.Country = request.Country;
        location.Address = request.Address;
        location.Latitude = request.Latitude;
        location.Longitude = request.Longitude;

        await repository.UpdateAsync(location, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var hotelCount = await db.Hotels.CountAsync(h => h.LocationId == location.Id, cancellationToken);

        return new LocationResponse(
            location.Id, location.City, location.Country, location.Address,
            location.Latitude, location.Longitude, hotelCount, location.CreatedAt);
    }
}
