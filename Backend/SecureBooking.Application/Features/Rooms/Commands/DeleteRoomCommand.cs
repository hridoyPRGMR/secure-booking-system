using MediatR;

namespace SecureBooking.Application.Features.Rooms;

public sealed record DeleteRoomCommand(Guid Id) : IRequest;
