using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Common.Exceptions;

namespace SecureBooking.Api.Infrastructure;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        return exception switch
        {
            ValidationException ex => await HandleValidationError(httpContext, ex, cancellationToken),
            UnauthorizedAccessException ex => await HandleUnauthorized(httpContext, ex, cancellationToken),
            NotFoundException ex => await HandleProblem(httpContext, StatusCodes.Status404NotFound, "Not Found",
                "https://tools.ietf.org/html/rfc9110#section-15.5.5", ex, cancellationToken),
            ConflictException ex => await HandleProblem(httpContext, StatusCodes.Status409Conflict, "Conflict",
                "https://tools.ietf.org/html/rfc9110#section-15.5.10", ex, cancellationToken),
            _ => false
        };
    }

    private async Task<bool> HandleProblem(HttpContext context, int status, string title, string type, Exception ex, CancellationToken ct)
    {
        logger.LogWarning(ex, "{Title}: {Message}", title, ex.Message);

        var details = new ProblemDetails
        {
            Status = status,
            Type = type,
            Title = title,
            Detail = ex.Message
        };

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(details, ct);
        return true;
    }

    private async Task<bool> HandleValidationError(HttpContext context, ValidationException ex, CancellationToken ct)
    {
        logger.LogWarning(ex, "Validation failed: {Message}", ex.Message);

        var errors = ex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        var details = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Validation Failed",
            Detail = "One or more validation errors occurred."
        };

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsJsonAsync(details, ct);
        return true;
    }

    private async Task<bool> HandleUnauthorized(HttpContext context, UnauthorizedAccessException ex, CancellationToken ct)
    {
        logger.LogWarning(ex, "Unauthorized access");

        var details = new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.2", 
            Title = "Unauthorized",
            Detail = ex.Message
        };

        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(details, ct);
        return true;
    }
}