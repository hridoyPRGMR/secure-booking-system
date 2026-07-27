using MediatR;
using SecureBooking.Application.Features.Rooms.Contracts;

namespace SecureBooking.Application.Features.Rooms.Queries.Get;

public sealed record Query(Guid Id) : IRequest<RoomResponse>;
