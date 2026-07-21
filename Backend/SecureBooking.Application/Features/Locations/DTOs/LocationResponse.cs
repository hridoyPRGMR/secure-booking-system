namespace SecureBooking.Application.Features.Locations;

public sealed record LocationResponse(
    Guid Id,
    string City,
    string Country,
    string Address,
    double? Latitude,
    double? Longitude,
    int HotelCount,
    DateTime CreatedAt
);
