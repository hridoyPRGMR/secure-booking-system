using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms;

public sealed record ListRoomsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    Guid? HotelId = null,
    RoomType? Type = null,
    bool? IsActive = null
) : IRequest<PagedResult<RoomResponse>>;
