using MediatR;

namespace SecureBooking.Application.Features.Users;

public sealed record DeleteUserCommand(Guid Id) : IRequest;
