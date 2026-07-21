using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms;

public sealed record RoomResponse(
    Guid Id,
    string Name,
    RoomType Type,
    string? Description,
    int Capacity,
    decimal PricePerNight,
    string? ImageUrl,
    bool IsActive,
    Guid HotelId,
    string HotelName,
    int BookingCount,
    DateTime CreatedAt
);
