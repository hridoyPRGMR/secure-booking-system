using MediatR;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Features.Authentication.Commands.Login;
using SecureBooking.Application.Features.Authentication.Commands.Register;

namespace SecureBooking.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthenticationController(IMediator mediator) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser(RegisterCommand command,CancellationToken cancellationToken)
        {
            var response = await mediator.Send(command, cancellationToken);

            return Created(string.Empty,response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginUser(LoginCommand command, CancellationToken cancellationToken)
        {
            var response = await mediator.Send(command,cancellationToken);

            return Ok(response);
        }
    }
}