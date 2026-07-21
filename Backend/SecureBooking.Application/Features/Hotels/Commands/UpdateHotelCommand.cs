using MediatR;

namespace SecureBooking.Application.Features.Hotels;

public sealed record UpdateHotelCommand(
    Guid Id,
    string Name,
    string? Description,
    int StarRating,
    string? ImageUrl,
    bool IsActive,
    Guid LocationId
) : IRequest<HotelResponse>;
