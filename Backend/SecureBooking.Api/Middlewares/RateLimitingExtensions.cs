using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

namespace SecureBooking.Api.Infrastructure;

/// <summary>Named rate-limit policies for the anonymous, abuse-prone auth endpoints. Limits come from "RateLimiting:*".</summary>
public static class RateLimitPolicies
{
    public const string ForgotPassword = "forgot-password";
    public const string ResetPassword = "reset-password";
    public const string LinkGoogle = "link-google";
}

public static class RateLimitingExtensions
{
    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services, IConfiguration config)
    {
        // Behind Azure's front end the socket address is the proxy; trust X-Forwarded-For so limits apply per real client.
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (context, ct) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    status = 429,
                    title = "Too Many Requests",
                    detail = "Too many attempts. Please wait a while and try again."
                }, ct);
            };

            AddPolicy(options, config, RateLimitPolicies.ForgotPassword, "ForgotPassword", 5, 15);
            AddPolicy(options, config, RateLimitPolicies.ResetPassword, "ResetPassword", 10, 15);
            AddPolicy(options, config, RateLimitPolicies.LinkGoogle, "LinkGoogle", 10, 15);
        });

        return services;
    }

    private static void AddPolicy(
        RateLimiterOptions options, IConfiguration config, string policy, string key, int defaultLimit, int defaultMinutes)
    {
        options.AddPolicy(policy, httpContext =>
        {
            // Read per request so limits can be tuned (and tests can override them) without code changes.
            var section = httpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection($"RateLimiting:{key}");
            var limit = section.GetValue("PermitLimit", defaultLimit);
            var minutes = section.GetValue("WindowMinutes", defaultMinutes);

            return RateLimitPartition.GetFixedWindowLimiter(
                $"{policy}:{httpContext.Connection.RemoteIpAddress}",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limit,
                    Window = TimeSpan.FromMinutes(minutes),
                    QueueLimit = 0
                });
        });
    }
}
