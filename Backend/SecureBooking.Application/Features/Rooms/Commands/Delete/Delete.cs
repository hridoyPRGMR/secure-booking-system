using MediatR;

namespace SecureBooking.Application.Features.Rooms.Commands.Delete;

public sealed record Delete(Guid Id) : IRequest;
