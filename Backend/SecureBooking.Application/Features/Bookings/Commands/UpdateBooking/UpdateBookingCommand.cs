using MediatR;
using SecureBooking.Shared.Enums;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Commands.UpdateBooking;

public sealed record UpdateBookingCommand(
    Guid Id,
    Guid UserId,
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    BookingStatus Status,
    string? Notes
) : IRequest<BookingResponse>;
