using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Features.Hotels;
using SecureBooking.Application.Features.Locations.Queries;
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
        [FromQuery] string? city = null,
        [FromQuery] string? country = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? starRatings = null,
        [FromQuery] double? reviewScoreMin = null,
        [FromQuery] string? amenities = null,
        [FromQuery] string? propertyTypes = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListHotelsQuery(
                page, pageSize, search, sortBy, sortDescending,
                LocationId: null, IsActive: true, City: city, Country: country,
                MinPrice: minPrice, MaxPrice: maxPrice,
                StarRatings: ParseInts(starRatings), ReviewScoreMin: reviewScoreMin,
                Amenities: ParseList(amenities), PropertyTypes: ParseEnums<PropertyType>(propertyTypes)),
            cancellationToken);
        return Ok(result);
    }

    private static List<int> ParseInts(string? csv) =>
        string.IsNullOrWhiteSpace(csv)
            ? []
            : csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(v => int.TryParse(v, out var n) ? n : (int?)null)
                .Where(v => v.HasValue)
                .Select(v => v!.Value)
                .ToList();

    private static List<string> ParseList(string? csv) =>
        string.IsNullOrWhiteSpace(csv)
            ? []
            : csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    private static List<T> ParseEnums<T>(string? csv) where T : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(csv))
            return [];

        return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(v => Enum.TryParse<T>(v, ignoreCase: true, out var e) ? e : (T?)null)
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .ToList();
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
        [FromQuery] DateTime? checkIn = null,
        [FromQuery] DateTime? checkOut = null,
        [FromQuery] string? city = null,
        [FromQuery] string? country = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListRoomsQuery(page, pageSize, search, sortBy, sortDescending, hotelId, type, IsActive: true, checkIn, checkOut, city, country),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("rooms/{id:guid}")]
    public async Task<IActionResult> GetRoom(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRoomByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpGet("locations")]
    public async Task<IActionResult> SearchLocations(
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new SearchLocationsQuery(20,search), cancellationToken);
        return Ok(result);
    }
}
