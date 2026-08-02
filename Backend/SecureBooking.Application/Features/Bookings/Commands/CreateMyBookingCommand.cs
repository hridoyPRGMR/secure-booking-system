using MediatR;

namespace SecureBooking.Application.Features.Bookings;

public sealed record CreateMyBookingCommand(
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    string? Notes
) : IRequest<BookingResponse>;
