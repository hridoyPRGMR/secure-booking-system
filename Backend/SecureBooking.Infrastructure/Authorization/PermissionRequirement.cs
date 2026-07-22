using Microsoft.AspNetCore.Authorization;

namespace SecureBooking.Infrastructure.Authorization;

public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
