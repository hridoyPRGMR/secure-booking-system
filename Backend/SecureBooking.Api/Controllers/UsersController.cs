using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Common.Security;
using SecureBooking.Application.Features.Users;

namespace SecureBooking.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.UsersView)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListUsersQuery(page, pageSize, search, sortBy, sortDescending, isActive), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Policies.UsersView)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.UsersCreate)]
    public async Task<IActionResult> Create(CreateUserCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.User.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.UsersUpdate)]
    public async Task<IActionResult> Update(Guid id, UpdateUserCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("Route id does not match payload id.");
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.UsersDelete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteUserCommand(id), cancellationToken);
        return NoContent();
    }
}
