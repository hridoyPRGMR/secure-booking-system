using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed record BookingResponse(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    Guid RoomId,
    string RoomName,
    string HotelName,
    DateTime CheckIn,
    DateTime CheckOut,
    BookingStatus Status,
    string? Notes,
    decimal TotalPrice,
    DateTime CreatedAt
);
