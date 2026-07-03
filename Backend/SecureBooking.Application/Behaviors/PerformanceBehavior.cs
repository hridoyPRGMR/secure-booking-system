using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace SecureBooking.Application.Behaviors;

public sealed class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private const int WarningThresholdMilliseconds = 500;

    public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = await next();
        stopwatch.Stop();

        if (stopwatch.ElapsedMilliseconds > WarningThresholdMilliseconds)
        {
            _logger.LogWarning("Long running request {RequestName} ({ElapsedMilliseconds}ms)", typeof(TRequest).Name, stopwatch.ElapsedMilliseconds);
        }

        return response;
    }
}
