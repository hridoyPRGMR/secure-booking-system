using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands.Refresh;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResponse>;
