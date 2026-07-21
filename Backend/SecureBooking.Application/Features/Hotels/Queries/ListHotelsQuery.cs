using MediatR;
using SecureBooking.Application.Common.Models;

namespace SecureBooking.Application.Features.Hotels;

public sealed record ListHotelsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    Guid? LocationId = null,
    bool? IsActive = null
) : IRequest<PagedResult<HotelResponse>>;
