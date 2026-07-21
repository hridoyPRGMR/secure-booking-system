using MediatR;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Locations;

public sealed class CreateLocationCommandHandler(
    IRepository<Location> repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateLocationCommand, LocationResponse>
{
    public async Task<LocationResponse> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = new Location
        {
            City = request.City,
            Country = request.Country,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
        };

        await repository.AddAsync(location, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new LocationResponse(
            location.Id, location.City, location.Country, location.Address,
            location.Latitude, location.Longitude, 0, location.CreatedAt);
    }
}
