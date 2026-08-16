using MediatR;

namespace SecureBooking.Application.Features.Bookings.Commands.CancelMyBooking;

public sealed record CancelMyBookingCommand(Guid Id) : IRequest;
