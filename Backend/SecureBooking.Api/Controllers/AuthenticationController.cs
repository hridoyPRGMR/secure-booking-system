using MediatR;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Features.Authentication.Commands.Login;
using SecureBooking.Application.Features.Authentication.Commands.Logout;
using SecureBooking.Application.Features.Authentication.Commands.Refresh;
using SecureBooking.Application.Features.Authentication.Commands.Register;

namespace SecureBooking.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthenticationController(IMediator mediator) : ControllerBase
    {
        private const string RefreshTokenCookieName = "refreshToken";

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser(RegisterCommand command, CancellationToken cancellationToken)
        {
            var response = await mediator.Send(command, cancellationToken);

            if (response.RefreshTokenExpiresAt is { } expiresAt)
                AppendRefreshTokenCookie(response.RefreshToken, expiresAt);

            return Created(string.Empty, response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginUser(LoginCommand command, CancellationToken cancellationToken)
        {
            var response = await mediator.Send(command, cancellationToken);

            if (response.RefreshTokenExpiresAt is { } expiresAt)
                AppendRefreshTokenCookie(response.RefreshToken, expiresAt);

            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(
            CancellationToken cancellationToken)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(refreshToken))
                return Unauthorized();

            var response = await mediator.Send(
                new RefreshTokenCommand(refreshToken),
                cancellationToken);

            AppendRefreshTokenCookie(response.RefreshToken, response.RefreshTokenExpiresAt);

            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (!string.IsNullOrWhiteSpace(refreshToken))
                await mediator.Send(new LogoutCommand(refreshToken), cancellationToken);

            Response.Cookies.Delete(RefreshTokenCookieName);

            return NoContent();
        }

        private void AppendRefreshTokenCookie(string refreshToken, DateTime expiresAt)
        {
            Response.Cookies.Append(
                RefreshTokenCookieName,
                refreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = expiresAt
                });
        }
    }
}