using MediatR;
using SecureBooking.Application.Features.Rooms.DTOs;

namespace SecureBooking.Application.Features.Rooms.Queries;

public sealed record GetRoomByIdQuery(Guid Id) : IRequest<RoomResponse>;
