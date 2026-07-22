namespace SecureBooking.Application.Features.Roles;

public sealed record RoleResponse(
    Guid Id,
    string Name,
    string Description,
    IReadOnlyList<string> PermissionCodes,
    int UserCount,
    DateTime CreatedAt
);
