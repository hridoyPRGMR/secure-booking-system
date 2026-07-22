using MediatR;

namespace SecureBooking.Application.Features.Roles;

public sealed record GetRoleByIdQuery(Guid Id) : IRequest<RoleResponse>;
