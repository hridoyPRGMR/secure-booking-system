using MediatR;

namespace SecureBooking.Application.Features.Bookings.Commands.Reservation;

public sealed record ReservationCommand(Guid Id) : IRequest;