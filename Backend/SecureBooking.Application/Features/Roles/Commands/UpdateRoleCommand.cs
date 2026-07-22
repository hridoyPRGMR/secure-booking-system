using MediatR;

namespace SecureBooking.Application.Features.Roles;

public sealed record UpdateRoleCommand(
    Guid Id,
    string Name,
    string Description,
    List<string> PermissionCodes
) : IRequest<RoleResponse>;
