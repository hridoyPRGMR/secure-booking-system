using MediatR;

namespace SecureBooking.Application.Features.Locations;

public sealed record DeleteLocationCommand(Guid Id) : IRequest;
