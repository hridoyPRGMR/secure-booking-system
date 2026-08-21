using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Hotels;

public sealed record HotelResponse(
    Guid Id,
    string Name,
    string? Description,
    int StarRating,
    double ReviewScore,
    PropertyType PropertyType,
    IReadOnlyList<string> Amenities,
    string? ImageUrl,
    bool IsActive,
    Guid LocationId,
    string LocationCity,
    string LocationCountry,
    int RoomCount,
    decimal? MinPricePerNight,
    DateTime CreatedAt
);
