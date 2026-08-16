using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Shared.Enums;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Queries.MyBookings;

public sealed record MyBookingsQuery(
    int Page = 1,
    int PageSize = 10,
    BookingStatus? Status = null
) : IRequest<PagedResult<BookingResponse>>;
