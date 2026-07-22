using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Common.Security;
using SecureBooking.Application.Features.Roles;

namespace SecureBooking.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/roles")]
public class RolesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.RolesView)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListRolesQuery(page, pageSize, search, sortBy, sortDescending), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Policies.RolesView)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRoleByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.RolesCreate)]
    public async Task<IActionResult> Create(CreateRoleCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.RolesUpdate)]
    public async Task<IActionResult> Update(Guid id, UpdateRoleCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("Route id does not match payload id.");
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RolesDelete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteRoleCommand(id), cancellationToken);
        return NoContent();
    }
}
