using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SecureBooking.Api.Infrastructure;
using SecureBooking.Application.Features.Authentication.Commands.Login;
using SecureBooking.Application.Features.Authentication.Commands.Logout;
using SecureBooking.Application.Features.Authentication.Commands.PasswordReset;
using SecureBooking.Application.Features.Authentication.Commands.Refresh;
using SecureBooking.Application.Features.Authentication.Commands.Register;

namespace SecureBooking.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthenticationController(IMediator mediator) : ControllerBase
    {
        private const string RefreshTokenCookieName = RefreshTokenCookies.Name;

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

        /// <summary>Always 204, whether or not the email has an account (prevents account enumeration).</summary>
        [HttpPost("forgot-password")]
        [EnableRateLimiting(RateLimitPolicies.ForgotPassword)]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command, CancellationToken cancellationToken)
        {
            await mediator.Send(command, cancellationToken);
            return NoContent();
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting(RateLimitPolicies.ResetPassword)]
        public async Task<IActionResult> ResetPassword(ResetPasswordCommand command, CancellationToken cancellationToken)
        {
            await mediator.Send(command, cancellationToken);
            return NoContent();
        }

        [HttpPost("refresh-token")]
        [RequireAllowedOrigin]
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
        [RequireAllowedOrigin]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (!string.IsNullOrWhiteSpace(refreshToken))
                await mediator.Send(new LogoutCommand(refreshToken), cancellationToken);

            Response.Cookies.Delete(RefreshTokenCookieName);

            return NoContent();
        }

        private void AppendRefreshTokenCookie(string refreshToken, DateTime expiresAt)
            => RefreshTokenCookies.Append(Response, refreshToken, expiresAt);
    }
}