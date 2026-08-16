using MediatR;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Commands.CreateMyBooking;

public sealed record CreateMyBookingCommand(
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    string? Notes
) : IRequest<BookingResponse>;
