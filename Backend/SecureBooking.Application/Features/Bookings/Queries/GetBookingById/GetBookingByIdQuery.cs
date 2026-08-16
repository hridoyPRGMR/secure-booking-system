using MediatR;
using SecureBooking.Application.Features.Bookings;

namespace SecureBooking.Application.Features.Bookings.Queries.GetBookingById;

public sealed record GetBookingByIdQuery(Guid Id) : IRequest<BookingResponse>;
