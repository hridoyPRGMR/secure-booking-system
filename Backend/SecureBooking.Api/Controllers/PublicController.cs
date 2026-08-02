using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Features.Hotels;
using SecureBooking.Application.Features.Rooms.Queries;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Api.Controllers;

/// <summary>Read-only, unauthenticated catalog browsing for the public site — no permission
/// claims required, unlike the admin-facing HotelsController/RoomsController.</summary>
[ApiController]
[AllowAnonymous]
[Route("api/public")]
public class PublicController(IMediator mediator) : ControllerBase
{
    [HttpGet("hotels")]
    public async Task<IActionResult> ListHotels(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        [FromQuery] Guid? locationId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListHotelsQuery(page, pageSize, search, sortBy, sortDescending, locationId, IsActive: true),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("hotels/{id:guid}")]
    public async Task<IActionResult> GetHotel(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetHotelByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> ListRooms(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        [FromQuery] Guid? hotelId = null,
        [FromQuery] RoomType? type = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListRoomsQuery(page, pageSize, search, sortBy, sortDescending, hotelId, type, IsActive: true),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("rooms/{id:guid}")]
    public async Task<IActionResult> GetRoom(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRoomByIdQuery(id), cancellationToken);
        return Ok(result);
    }
}
