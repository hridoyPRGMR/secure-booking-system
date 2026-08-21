using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Hotels;

public sealed record ListHotelsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    Guid? LocationId = null,
    bool? IsActive = null,
    string? City = null,
    string? Country = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    IReadOnlyCollection<int>? StarRatings = null,
    double? ReviewScoreMin = null,
    IReadOnlyCollection<string>? Amenities = null,
    IReadOnlyCollection<PropertyType>? PropertyTypes = null
) : IRequest<PagedResult<HotelResponse>>;
