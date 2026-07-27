using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Features.Rooms.Contracts;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms.Queries.List;

public sealed record Query(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    Guid? HotelId = null,
    RoomType? Type = null,
    bool? IsActive = null
) : IRequest<PagedResult<RoomResponse>>;
