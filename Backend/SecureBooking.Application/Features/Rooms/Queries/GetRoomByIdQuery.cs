using MediatR;

namespace SecureBooking.Application.Features.Rooms;

public sealed record GetRoomByIdQuery(Guid Id) : IRequest<RoomResponse>;
