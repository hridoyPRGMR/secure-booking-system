using MediatR;

namespace SecureBooking.Application.Features.Ping.Commands;

public sealed record PingCommand(string Message) : IRequest<PingResponse>;
