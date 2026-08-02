using MediatR;

namespace SecureBooking.Application.Features.Rooms.Commands;

public sealed record DeleteRoomCommand(Guid Id) : IRequest;
