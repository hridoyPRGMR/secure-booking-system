using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed record ListBookingsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    Guid? UserId = null,
    Guid? RoomId = null,
    BookingStatus? Status = null
) : IRequest<PagedResult<BookingResponse>>;
