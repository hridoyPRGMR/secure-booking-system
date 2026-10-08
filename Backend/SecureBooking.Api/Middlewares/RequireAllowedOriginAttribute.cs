using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SecureBooking.Api.Infrastructure;

/// <summary>
/// CSRF defence for endpoints that authenticate with the refresh cookie. Browsers always send an Origin header
/// on cross-site POSTs; if it is present it must be one of Cors:AllowedOrigins. Requests with no Origin
/// (non-browser clients) cannot be a browser CSRF attack and are let through.
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class RequireAllowedOriginAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var origin = context.HttpContext.Request.Headers.Origin.ToString();
        if (string.IsNullOrEmpty(origin)) return;

        var allowed = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>()
            .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        if (!allowed.Contains(origin.TrimEnd('/'), StringComparer.OrdinalIgnoreCase))
        {
            context.HttpContext.RequestServices.GetRequiredService<ILogger<RequireAllowedOriginAttribute>>()
                .LogWarning("Rejected cookie-authenticated request from disallowed origin {Origin}.", origin);
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
        }
    }
}
