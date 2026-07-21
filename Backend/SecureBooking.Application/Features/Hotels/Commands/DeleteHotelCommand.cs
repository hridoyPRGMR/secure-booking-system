using MediatR;

namespace SecureBooking.Application.Features.Hotels;

public sealed record DeleteHotelCommand(Guid Id) : IRequest;
