using MediatR;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed record UpdateBookingCommand(
    Guid Id,
    Guid UserId,
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    BookingStatus Status,
    string? Notes
) : IRequest<BookingResponse>;
