using MediatR;
using SecureBooking.Shared.Enums;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Commands.CreateBooking;

public sealed record CreateBookingCommand(
    Guid UserId,
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    BookingStatus Status,
    string? Notes
) : IRequest<BookingResponse>;
