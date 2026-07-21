using MediatR;

namespace SecureBooking.Application.Features.Hotels;

public sealed record GetHotelByIdQuery(Guid Id) : IRequest<HotelResponse>;
