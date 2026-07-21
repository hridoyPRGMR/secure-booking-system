using MediatR;
using SecureBooking.Application.Common.Authentication;

namespace SecureBooking.Application.Features.Authentication.Commands.Logout;

public sealed class LogoutCommandHandler(IRefreshTokenService refreshTokenService)
    : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await refreshTokenService.RevokeAsync(request.RefreshToken, cancellationToken);
        return Unit.Value;
    }
}
