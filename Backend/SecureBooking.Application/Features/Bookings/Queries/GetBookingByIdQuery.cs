using MediatR;

namespace SecureBooking.Application.Features.Bookings;

public sealed record GetBookingByIdQuery(Guid Id) : IRequest<BookingResponse>;
