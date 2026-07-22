using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Common.Security;
using SecureBooking.Application.Features.Locations;

namespace SecureBooking.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/locations")]
public class LocationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.LocationsView)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListLocationsQuery(page, pageSize, search, sortBy, sortDescending), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Policies.LocationsView)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLocationByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.LocationsCreate)]
    public async Task<IActionResult> Create(CreateLocationCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.LocationsUpdate)]
    public async Task<IActionResult> Update(Guid id, UpdateLocationCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("Route id does not match payload id.");
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.LocationsDelete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteLocationCommand(id), cancellationToken);
        return NoContent();
    }
}
