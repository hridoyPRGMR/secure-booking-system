using MediatR;

namespace SecureBooking.Application.Features.Locations;

public sealed record UpdateLocationCommand(
    Guid Id,
    string City,
    string Country,
    string Address,
    double? Latitude,
    double? Longitude
) : IRequest<LocationResponse>;
