using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SecureBooking.Infrastructure.Authorization;

/// <summary>
/// Auto-generates an authorization policy for any policy name of the form "Permission:{code}"
/// (e.g. "Permission:Users.View"), so controllers can reference policies via
/// SecureBooking.Application.Common.Security.Policies without each one needing to be registered
/// by hand in DI. Anything not matching the prefix falls back to the default policy provider.
/// </summary>
public sealed class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    public const string Prefix = "Permission:";

    private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallbackPolicyProvider.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallbackPolicyProvider.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
        {
            var permissionCode = policyName[Prefix.Length..];

            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(permissionCode))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return _fallbackPolicyProvider.GetPolicyAsync(policyName);
    }
}
