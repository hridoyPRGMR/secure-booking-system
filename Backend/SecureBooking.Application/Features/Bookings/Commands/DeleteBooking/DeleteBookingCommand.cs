using MediatR;

namespace SecureBooking.Application.Features.Bookings.Commands.DeleteBooking;

public sealed record DeleteBookingCommand(Guid Id) : IRequest;
