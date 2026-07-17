using MediatR;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Features.Authentication.Commands;

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
    }
}