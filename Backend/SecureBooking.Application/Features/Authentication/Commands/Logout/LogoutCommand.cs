using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands.Logout;

public sealed record LogoutCommand(string RefreshToken) : IRequest;
