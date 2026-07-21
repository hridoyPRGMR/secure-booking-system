using MediatR;

namespace SecureBooking.Application.Features.Locations;

public sealed record GetLocationByIdQuery(Guid Id) : IRequest<LocationResponse>;
