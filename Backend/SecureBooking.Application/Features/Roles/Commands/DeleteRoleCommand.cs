using MediatR;

namespace SecureBooking.Application.Features.Roles;

public sealed record DeleteRoleCommand(Guid Id) : IRequest;
