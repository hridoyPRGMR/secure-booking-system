using MediatR;
using SecureBooking.Application.Common.Authentication;
namespace SecureBooking.Application.Features.Authentication.Commands.Refresh;

public sealed class RefreshTokenCommandHandler(
    IRefreshTokenService refreshTokenService)
    : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
{
    public async Task<RefreshTokenResponse> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
         return await refreshTokenService.RefreshAsync(
            request.RefreshToken,
            cancellationToken);
    }
}