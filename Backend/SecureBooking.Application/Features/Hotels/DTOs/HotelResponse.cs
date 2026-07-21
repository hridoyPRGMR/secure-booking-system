namespace SecureBooking.Application.Features.Hotels;

public sealed record HotelResponse(
    Guid Id,
    string Name,
    string? Description,
    int StarRating,
    string? ImageUrl,
    bool IsActive,
    Guid LocationId,
    string LocationCity,
    string LocationCountry,
    int RoomCount,
    DateTime CreatedAt
);
