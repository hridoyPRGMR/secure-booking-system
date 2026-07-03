using MediatR;

namespace SecureBooking.Application.Features.Ping.Commands;

public sealed class PingCommandHandler : IRequestHandler<PingCommand, PingResponse>
{
    public Task<PingResponse> Handle(PingCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new PingResponse($"Pong: {request.Message}"));
    }
}
