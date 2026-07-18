using MediatR;
using SecureBooking.Application.Features.Authentication.Commands.Refresh;

namespace SecureBooking.Application.Features.Authentication.Commands.Refresh;

public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResponse>;