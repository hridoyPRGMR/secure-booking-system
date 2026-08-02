using MediatR;

namespace SecureBooking.Application.Features.Bookings;

public sealed record CancelMyBookingCommand(Guid Id) : IRequest;
