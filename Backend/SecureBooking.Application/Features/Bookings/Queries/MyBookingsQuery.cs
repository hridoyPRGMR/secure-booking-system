using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed record MyBookingsQuery(
    int Page = 1,
    int PageSize = 10,
    BookingStatus? Status = null
) : IRequest<PagedResult<BookingResponse>>;
