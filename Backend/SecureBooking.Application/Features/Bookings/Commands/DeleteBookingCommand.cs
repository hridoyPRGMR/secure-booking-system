using MediatR;

namespace SecureBooking.Application.Features.Bookings;

public sealed record DeleteBookingCommand(Guid Id) : IRequest;
