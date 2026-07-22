using MediatR;

namespace SecureBooking.Application.Features.Roles;

public sealed record CreateRoleCommand(
    string Name,
    string Description,
    List<string> PermissionCodes
) : IRequest<RoleResponse>;
